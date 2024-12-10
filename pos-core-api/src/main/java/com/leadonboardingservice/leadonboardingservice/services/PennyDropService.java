package com.leadonboardingservice.leadonboardingservice.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request.PennyDropRequestDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.BeneficiaryResponseDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.PennyDropResponseDto;
import lombok.SneakyThrows;

public interface PennyDropService {

    BeneficiaryResponseDto addBeneficiary(PennyDropRequestDto pennyDropRequestDto) throws PennyDropException;

    @SneakyThrows
    PennyDropResponseDto addPennyDrop(String beneficiaryId) throws PennyDropException, JsonProcessingException;
}
