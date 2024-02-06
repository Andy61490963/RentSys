using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using 國立臺東大學租借網.Data;
using 國立臺東大學租借網.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingsApiController : ControllerBase
{
    private readonly BookingRepository _bookingRepository;

    public BookingsApiController(BookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    [AllowAnonymous]
    // GetAllBookingDatesAndTimes
    [HttpGet("AllBookings")]
    public async Task<IActionResult> GetAllBookingDatesAndTimes()
    {
        try
        {
            var bookingDatesAndTimes = await _bookingRepository.GetAllBookingDatesAndTimes();
            return Ok(bookingDatesAndTimes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("AddBooking")]
    public async Task<IActionResult> AddBooking([FromBody] Booking booking)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
            {
                return Unauthorized("Invalid User ID");
            }

            booking.UserId = userId.Value;
            await _bookingRepository.AddBooking(booking);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpDelete("DeleteBooking")]
    public async Task<IActionResult> DeleteBooking([FromBody] DeleteBookings deleteBookings)
    {
        
        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
            {
                return Unauthorized("Invalid User ID");
            }

            deleteBookings.UserId = userId.Value;
            await _bookingRepository.DeleteBooking(deleteBookings);
            return Ok("Booking deleted successfully.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    //[Authorize]
    [HttpGet("Bookings")]
    public async Task<IActionResult> GetUserBookings()
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
            {
                return Unauthorized("Invalid User ID");
            }

            var bookings = await _bookingRepository.GetUserBookings(userId.Value);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
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