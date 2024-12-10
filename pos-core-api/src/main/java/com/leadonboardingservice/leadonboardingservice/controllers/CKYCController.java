package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CKYCSearchRequest;
import com.leadonboardingservice.leadonboardingservice.dtos.response.*;
import com.leadonboardingservice.leadonboardingservice.services.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("api/v1")
@AllArgsConstructor
@SecurityRequirement(name = "los-api")
public class CKYCController {

    private final LeadManager leadManager;
    private final CKYCService ckycService;
    private final OKYCService okycService;
    private final PanVerificationAdapterService panVerificationAdapterService;

    @PostMapping("/leads/ckyc/{leadId}")
    @ResponseBody
    GenericResponse<LeadDetailsResponseDto> updateCKYCDetails(@PathVariable String leadId,@Valid @RequestBody LeadProfileDto leadProfileDto) throws Exception{
        leadManager.updateLeadProfile(leadId, leadProfileDto);
        LeadDetailsResponseDto lead = leadManager.updateLeadKyc(leadId,leadProfileDto);
        return GenericResponse.<LeadDetailsResponseDto>builder()
                .message("lead kyc successful")
                .data(lead)
                .statusCode(HttpStatus.OK.value())
                .build();
    }


    @PostMapping("/ckyc/search")
    @ResponseBody
    GenericResponse<CKYCSearchResponse> searchCKYCDetails(@Valid @RequestBody CKYCSearchRequest searchRequest) {
        CKYCSearchResponse data = ckycService.searchCKYC(searchRequest);
        return GenericResponse.<CKYCSearchResponse>builder()
                .message("cKYC search successful")
                .data(data)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/okyc")
    @ResponseBody
    GenericResponse<OKYCRedirectionResponse> createRedirectionURL(@RequestBody Map<String,String> request) {
        OKYCRedirectionResponse data = okycService.createRedirectionURL(request);
        return GenericResponse.<OKYCRedirectionResponse>builder()
                .message("oKYC redirection url generated")
                .data(data)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/okyc/{requestId}")
    @ResponseBody
    GenericResponse<OKYCDetailsResponse> getOKYCDetails(@PathVariable String requestId) {
        OKYCDetailsResponse data = okycService.getOKYCDetails(requestId);
        return GenericResponse.<OKYCDetailsResponse>builder()
                .message("oKYC details fetched successfully")
                .data(data)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/validate-pan")
    @ResponseBody
    GenericResponse<PanVerificationResponse> verifyPANDetails(@Valid @RequestBody PanValidationRequestDto panValidationRequestDto) throws Exception {
        PanVerificationResponse panDetails = panVerificationAdapterService.verifyPan(panValidationRequestDto);
            return GenericResponse.<PanVerificationResponse>builder()
                .message("PAN details fetched")
                .data(panDetails)
                .statusCode(HttpStatus.OK.value())
                .build();
   }

}
