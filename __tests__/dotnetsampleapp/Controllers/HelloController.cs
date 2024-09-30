using Microsoft.AspNetCore.Mvc;

namespace DOTNET_8_APP.Controllers
{
    [ApiController]
    public class HelloController : Controller
    {
        private readonly ILogger<HelloController> _logger;
        private const string dummyAppSetting = "DUMMY_APPSETTING";

        public HelloController(ILogger<HelloController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("/")]
        public string Hello()
        {
            Console.WriteLine("Hello endpoint called!");
            return "Hello Hii from .NET 8 App";
        }

        [HttpGet]
        [Route("/dummy")]
        public string DummyAppsetting()
        {
            Console.WriteLine("Dummy endpoint called!");
            var dummyAppSettingValue = Environment.GetEnvironmentVariable(dummyAppSetting);
            if (dummyAppSettingValue != null) { return dummyAppSettingValue; }
            return "Appsetting not found!";
        }

        [HttpGet]
        [Route("/placeholder")]
        public string PlaceHolder()
        {
            Console.WriteLine("Placeholder endpoint called!");
            return "<<<net-place-holder>>>";
        }
    }
}
