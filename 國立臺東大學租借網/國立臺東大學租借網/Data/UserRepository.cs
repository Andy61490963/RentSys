using Dapper;
using 國立臺東大學租借網.Models;
using System.Data.SqlClient;
using System.Threading.Tasks;

public class UserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }


    // 添加新用戶
    public async Task AddUser(User user)
    {
        var sql = "INSERT INTO Users (Username, PasswordHash, Role) VALUES (@Username, @PasswordHash, @Role)";

        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.ExecuteAsync(sql, user);
        }
    }
    // 更新用戶Token
    public async Task UpdateUserToken(User user)
    {
        // 定义SQL更新命令，更新RefreshToken和RefreshTokenExpiryTime字段
        var sql = @"UPDATE Users SET RefreshToken = @RefreshToken, RefreshTokenExpiryTime = @RefreshTokenExpiryTime WHERE Id = @Id";

        using (var connection = new SqlConnection(_connectionString))
        {
            // 使用Dapper执行更新操作
            await connection.ExecuteAsync(sql, new
            {
                RefreshToken = user.RefreshToken,
                RefreshTokenExpiryTime = user.RefreshTokenExpiryTime,
                Id = user.Id
            });
        }
    }

    public async Task<User> GetUserByRefreshToken(string refreshToken)
    {
        // 定义SQL查询命令，根据RefreshToken获取用户信息
        var sql = "SELECT * FROM Users WHERE RefreshToken = @RefreshToken";

        using (var connection = new SqlConnection(_connectionString))
        {
            // 使用Dapper的QueryFirstOrDefaultAsync方法执行查询
            // 如果找到匹配的用户，将返回该用户的信息；否则，返回null
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { RefreshToken = refreshToken });
        }
    }

    // 檢查用戶名是否存在
    public async Task<bool> UsernameExists(string username)
    {
        // 定義 SQL 查詢命令，檢查指定用戶名是否存在
        var sql = "SELECT COUNT(1) FROM Users WHERE Username = @Username";

        // 創建與數據庫的連接
        using (var connection = new SqlConnection(_connectionString))
        {
            // 執行 SQL 查詢並返回結果
            var exists = await connection.ExecuteScalarAsync<bool>(sql, new { Username = username });
            return exists;
        }
    }

    // 驗證用戶
    public async Task<User> ValidateUser(string username, string passwordHash)
    {
        var sql = "SELECT * FROM Users WHERE Username = @Username AND PasswordHash = @PasswordHash";

        using (var connection = new SqlConnection(_connectionString))
        {
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username, PasswordHash = passwordHash });
        }
    }

    public async Task<User> GetUserById(int userId)
    {
        var sql = "SELECT * FROM Users WHERE Id = @Id";

        using (var connection = new SqlConnection(_connectionString))
        {
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = userId });
        }
    }


    //列出所有用戶
    public async Task<IEnumerable<User>> GetAllUsers()
    {
        // 定義 SQL 查詢命令
        var sql = "SELECT * FROM Users";

        // 使用 SqlConnection 連接數據庫
        using (var connection = new SqlConnection(_connectionString))
        {
            // 使用 Dapper 的 Query 方法執行 SQL 查詢並返回用戶列表
            var users = await connection.QueryAsync<User>(sql);
            return users;
        }
    }


}
