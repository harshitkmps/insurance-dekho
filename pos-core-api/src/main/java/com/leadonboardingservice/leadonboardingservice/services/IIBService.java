package com.leadonboardingservice.leadonboardingservice.services;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.dtos.response.IRDAIRegistrationResponse;

public interface IIBService {
    IRDAIRegistrationResponse getIIBRegistration(String pan) throws Exception;
}
