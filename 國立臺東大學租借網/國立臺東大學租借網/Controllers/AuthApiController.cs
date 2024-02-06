using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Win32;
using 國立臺東大學租借網.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AuthApiController : ControllerBase
{
    private readonly AuthenticationService _authenticationService;
    private readonly UserRepository _userRepository;
    private readonly IConfiguration _config;

    // 注入DI
    public AuthApiController(AuthenticationService authenticationService, UserRepository userRepository, IConfiguration config)
    {
        _authenticationService = authenticationService;
        _userRepository = userRepository;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Register model)
    {
        // 驗證請求模型的狀態
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // 檢查用戶名是否已存在
        if (await _userRepository.UsernameExists(model.Username))
        {
            return BadRequest(new { message = "Username already exists" });
        }

        // 創建一個新的 User 對象並對密碼進行加密
        var user = new User
        {
            Username = model.Username,
            PasswordHash = HashPassword(model.Password),
            Role = "Student" // 設置預設身分為"Student"
        };

        // 使用 UserRepository 將新用戶添加到資料庫
        await _userRepository.AddUser(user);

        // 返回註冊成功的信息
        return Ok(new { message = "Registration successful" });
    }

    [HttpPost("login")] // 登录接口
    public async Task<IActionResult> Login([FromBody] Login model)
    {
        // 先用Authenticate雜湊密碼，再去跟DB的雜湊密碼確認
        var user = await _authenticationService.Authenticate(model.Username, model.Password);

        if (user != null)
        {
            var token = GenerateJwtToken(user.Id);

            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
            await _userRepository.UpdateUserToken(user); // 更新用户信息以保存刷新令牌和其到期时间

            var cookieOptions = new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.None,
                //HttpOnly = true, 
                Expires = DateTime.Now.AddDays(7), // 設置過期時間，例如1天後過期
                Path = "/" // 設置Cookie的路徑
            };
            HttpContext.Response.Cookies.Append("token", token, cookieOptions);

            return Ok(new { token = token, refreshToken = refreshToken });
        }

        return Unauthorized();
    }


    private string GenerateJwtToken(int userId)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>();

        //claims.Add(new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()));
        claims.Add(new Claim("Sub", userId.ToString()));

        var token = new JwtSecurityToken(

            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Issuer"],
            claims: claims, // 使用 claims 變數
            expires: DateTime.Now.AddHours(1),

            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var generator = RandomNumberGenerator.Create();

        generator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);

    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] Refresh model)
    {
        var principal = GetPrincipalFromExpiredToken(model.AccessToken);

        if (principal == null)
        {
            return BadRequest("Invalid token");
        }


        var userId = int.Parse(principal.Claims.First(x => x.Type == "Sub").Value);
        var user = await _userRepository.GetUserById(userId);
        if (user == null || user.RefreshToken != model.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
        {
            return BadRequest("Invalid token or refresh token expired");
        }

        var newJwtToken = GenerateJwtToken(user.Id);

        var cookieOptions = new CookieOptions
        {
            //HttpOnly = true, 
            Expires = DateTime.Now.AddDays(7), // 設置過期時間，例如1天後過期
            Path = "/" // 設置Cookie的路徑
        };
        HttpContext.Response.Cookies.Append("token", newJwtToken, cookieOptions);
        return new ObjectResult(new
        {
            token = newJwtToken,
            refreshToken = model.RefreshToken
        });
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])),
            ValidateIssuer = true,
            ValidIssuer = _config["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = _config["Jwt:Issuer"],
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken securityToken;
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
        var jwtSecurityToken = securityToken as JwtSecurityToken;
        if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }


    private string HashPassword(string password)
    {
        // 對密碼進行 SHA256 加密
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            byte[] passwordBytes = System.Text.Encoding.UTF8.GetBytes(password);
            byte[] hashBytes = sha256.ComputeHash(passwordBytes);
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }
    }


    [HttpGet("users")] // 獲取所有用戶信息的接口
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
            {
                return Unauthorized("Invalid User ID");
            }
            // 使用用戶ID獲取當前用戶的信息
            var user = await _userRepository.GetUserById(userId.Value);
            return Ok(user);
        }
        catch (Exception ex)
        {
            // 處理可能發生的異常
            return StatusCode(500, new { message = ex.Message });
        }
    }
    // 萃取Sub裡面的userId
    private int? GetUserIdFromToken()
    {
        //var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userId = User.FindFirst("Sub")?.Value;
        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var parsedUserId))
        {
            return null;
        }
        return parsedUserId;
    }

}
