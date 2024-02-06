using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using 國立臺東大學租借網.Models;

namespace 國立臺東大學租借網.Controllers
{
    public class AuthBtnController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public AuthBtnController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }
        public IActionResult Register()
        {
            return View();
        }
        public IActionResult Login()
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
