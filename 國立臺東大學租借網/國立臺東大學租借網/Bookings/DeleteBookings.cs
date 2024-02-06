namespace 國立臺東大學租借網.Models
{
    public class DeleteBookings
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public DateTime BookingDate { get; set; }
        public TimeSpan BookingTime { get; set; }
        public int FacilityId { get; set; }
    }

}