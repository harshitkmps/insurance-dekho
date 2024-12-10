package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.Address;

import java.util.List;

public interface LeadAddressService {
    List<Address> updateLeadAddressDetails(String leadUUID, List<Address> leadAddress);
}
