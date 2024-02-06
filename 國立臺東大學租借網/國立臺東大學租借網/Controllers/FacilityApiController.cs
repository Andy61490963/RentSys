using Microsoft.AspNetCore.Mvc;
using 國立臺東大學租借網.Data;

[ApiController]
[Route("api/[controller]")]
public class FacilityApiController : ControllerBase
{
    private readonly FacilityRepository _facilityRepository;

    public FacilityApiController(FacilityRepository facilityRepository)
    {
        _facilityRepository = facilityRepository;
    }

    [HttpGet("facilities")]
    public async Task<IActionResult> GetAllFacilities()
    {
        try
        {
            var facilities = await _facilityRepository.GetAllFacilities();
            return Ok(facilities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
