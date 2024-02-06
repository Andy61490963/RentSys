using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using 國立臺東大學租借網.Models;

namespace 國立臺東大學租借網.Controllers
{
    public class RentController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public RentController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult RentPage()
        {
            return View();
        }
        public IActionResult RentDetail()
        {
            return View();
        }

        public IActionResult MyRent()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
