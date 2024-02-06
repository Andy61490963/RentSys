namespace 國立臺東大學租借網.Data
{
    using Dapper;
    using System.Data.SqlClient;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using 國立臺東大學租借網.Models;

    public class BookingRepository
    {
        private readonly string _connectionString;

        public BookingRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }
        //根據userid取得所有預定
        public async Task<IEnumerable<AllBookings>> GetAllBookingDatesAndTimes()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return await connection.QueryAsync<AllBookings>(
                    "SELECT UserId, FacilityId, BookingDate, BookingTime FROM Bookings"
                );
            }
        }

        // 根據userid和場地新增預定
        public async Task AddBooking(Booking booking)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.ExecuteAsync(
                    "INSERT INTO Bookings (UserId, FacilityId, BookingDate, BookingTime, Status) VALUES (@UserId, @FacilityId, @BookingDate, @BookingTime, @Status)",
                    booking
                );
            }
        }

        // 根據userid和FacilityId和BookingDate和BookingTime刪除預定
        public async Task DeleteBooking(DeleteBookings deleteBookings)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.ExecuteAsync(
                    "DELETE FROM Bookings WHERE UserId = @UserId AND FacilityId = @FacilityId AND BookingDate = @BookingDate AND BookingTime = @BookingTime",
                    deleteBookings
                );
            }
        }

        // 根據userId取得使用者的所有預定
        public async Task<IEnumerable<UserBookings>> GetUserBookings(int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return await connection.QueryAsync<UserBookings>(
                     "SELECT Bookings.BookingDate, Bookings.BookingTime, Facilities.Name FROM Bookings JOIN Facilities ON Bookings.FacilityId = Facilities.Id Where UserId = 12 ORDER BY BookingDate, BookingTime",
                    new { UserId = userId }
                );
            }
        }


    }

}