package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateAccessTokenRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.AccessTokenResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.DigilockerDetailsResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.AadharDetails;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.PanDetails;
import com.leadonboardingservice.leadonboardingservice.services.DigiLockerService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.DigilockerDocumentsResponseDto;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@Controller
@RequestMapping("api/v1")
@AllArgsConstructor
@SecurityRequirement(name = "los-api")
public class DigiLockerController {

    private final DigiLockerService digiLockerService;
    private HttpServletRequest request;

    @PostMapping("/leads/digilocker/token")
    @ResponseBody
    GenericResponse<AccessTokenResponseDto> getAccessToken(@Valid @RequestBody CreateAccessTokenRequestDto createAccessTokenRequestDto) throws Exception {
        AccessTokenResponseDto response = digiLockerService.getAccessToken(createAccessTokenRequestDto.getAuthorizationCode(), createAccessTokenRequestDto.getSource(), createAccessTokenRequestDto.getCodeVerifier());
        return GenericResponse.<AccessTokenResponseDto>builder()
                .message("Access Token Received successfully")
                .data(response)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/leads/digilocker/issued-documents")
    @ResponseBody
    GenericResponse<?> getIssuedDocuments(@RequestParam String accessToken) throws Exception {
        DigilockerDocumentsResponseDto response = digiLockerService.getIssuedDocuments(accessToken);
        return GenericResponse.<DigilockerDocumentsResponseDto>builder()
                .message("Issued Documents fetched successfully")
                .data(response)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/leads/digilocker/document")
    @ResponseBody
    ResponseEntity<DocumentServiceResponseDto> getFileFromURI(@RequestParam String accessToken, @RequestParam String uri,@RequestParam String docType) throws Exception {
        DocumentServiceResponseDto response = digiLockerService.getDocumentFromURI(accessToken, uri, docType);
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/leads/digilocker/eaadhar")
    @ResponseBody
    GenericResponse<AadharDetails> getEaadhar(@RequestParam String accessToken) throws Exception {
        AadharDetails response = digiLockerService.getEaadhar(accessToken);
        return GenericResponse.<AadharDetails>builder()
                .message("Eaadhar received successfully")
                .data(response)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/leads/digilocker/file-data")
    @ResponseBody
    GenericResponse<PanDetails> getFileData(@RequestParam String accessToken, @RequestParam String uri) throws Exception {
        PanDetails response = digiLockerService.getFileDataFromURI(accessToken, uri);
        return GenericResponse.<PanDetails>builder()
                .message("Eaadhar received successfully")
                .data(response)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/leads/digilocker")
    @ResponseBody
    GenericResponse<DigilockerDetailsResponseDto> fetchDigilockerDetails(@RequestParam String code, @RequestParam String uuid, @RequestParam String source, @RequestParam String codeVerifier) throws Exception {
        AccessTokenResponseDto accessTokenResponse = digiLockerService.getAccessToken(code, source, codeVerifier);
        DigilockerDetailsResponseDto digilockerDetailsResponseDto = digiLockerService.fetchDigilockerDetails(accessTokenResponse, uuid);
        return GenericResponse.<DigilockerDetailsResponseDto>builder()
                .message("Digilocker details fetched successfully")
                .data(digilockerDetailsResponseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

}
