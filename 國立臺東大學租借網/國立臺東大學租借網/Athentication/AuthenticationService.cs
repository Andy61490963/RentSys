using 國立臺東大學租借網.Models;
public class AuthenticationService
{
    private readonly UserRepository _userRepository;

    public AuthenticationService(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User> Authenticate(string username, string password)
    {
        // 實現密碼的雜湊處理
        var passwordHash = HashPassword(password);

        // 使用 UserRepository 驗證用戶
        var user = await _userRepository.ValidateUser(username, passwordHash);

        // 如果用戶不存在或密碼錯誤，返回 null
        if (user == null)
        {
            return null;
        }

        return user;
    }

    private string HashPassword(string password)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            // 將密碼轉換為 byte 數組
            byte[] passwordBytes = System.Text.Encoding.UTF8.GetBytes(password);

            // 進行雜湊處理
            byte[] hashBytes = sha256.ComputeHash(passwordBytes);

            // 將雜湊後的 byte 數組轉換為字符串
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }
    }

}
