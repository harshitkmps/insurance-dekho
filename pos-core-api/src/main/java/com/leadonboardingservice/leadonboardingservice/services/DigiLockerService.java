package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.response.AccessTokenResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.DigilockerDetailsResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.AadharDetails;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.PanDetails;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.DigilockerDocumentsResponseDto;

public interface DigiLockerService {

    AccessTokenResponseDto getAccessToken(String code, String source, String codeVerifier) throws Exception;

    DigilockerDocumentsResponseDto getIssuedDocuments(String token) throws Exception;

    AadharDetails getEaadhar(String token) throws Exception;

    DocumentServiceResponseDto getDocumentFromURI(String token, String uri, String docType) throws Exception;

    DigilockerDetailsResponseDto fetchDigilockerDetails(AccessTokenResponseDto token, String uuid) throws Exception;

    PanDetails getFileDataFromURI(String token, String uri) throws Exception;
}
