namespace 國立臺東大學租借網.Data
{
    using Dapper;
    using 國立臺東大學租借網.Models;
    using System.Data.SqlClient;
    using System.Threading.Tasks;

    public class FacilityRepository
    {
        private readonly string _connectionString;

        public FacilityRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<IEnumerable<Facility>> GetAllFacilities()
        {
            var sql = "SELECT * FROM Facilities";

            using (var connection = new SqlConnection(_connectionString))
            {
                return await connection.QueryAsync<Facility>(sql);
            }
        }
    }

}