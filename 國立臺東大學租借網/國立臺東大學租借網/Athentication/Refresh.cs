namespace 國立臺東大學租借網.Models
{
    public class Refresh
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}