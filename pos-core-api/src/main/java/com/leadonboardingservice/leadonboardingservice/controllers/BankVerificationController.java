package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerifierResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.CreateLeadResponseDto;
import com.leadonboardingservice.leadonboardingservice.services.BankVerificationAdapterService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("api/v1")
@AllArgsConstructor
@Slf4j
@SecurityRequirement(name = "los-api")
public class BankVerificationController {

    private final BankVerificationAdapterService bankVerificationAdapterService;

    @PostMapping("/account/verify")
    @ResponseBody
    GenericResponse<BankVerifierResponseDto> verifyAccount(@Valid @RequestBody BankVerificationRequestDto bankVerificationRequestDto) throws Exception{
        BankVerificationResponseDto bankVerificationResponseDto = bankVerificationAdapterService.verifyAccount(bankVerificationRequestDto);
        BankVerifierResponseDto responseDto = BankVerifierResponseDto.builder()
                .beneNameAtBank(bankVerificationResponseDto.getBeneNameAtBank())
                .messageFromBank(bankVerificationResponseDto.getMessageFromBank())
                .message(bankVerificationResponseDto.getMessage())
                .nameMatch(bankVerificationResponseDto.getNameMatch())
                .isBankVerified(bankVerificationResponseDto.isBankVerified()).build();
        return GenericResponse.<BankVerifierResponseDto>builder()
                .message("bank account verified successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
