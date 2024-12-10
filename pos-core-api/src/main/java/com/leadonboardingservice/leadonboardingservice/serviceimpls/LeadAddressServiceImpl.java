package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.models.Address;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadAddressRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadAddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadAddressServiceImpl implements LeadAddressService {

    private final LeadRepository leadRepository;
    private final LeadAddressRepository leadAddressRepository;

    @Override
    public List<Address> updateLeadAddressDetails(String leadUUID, List<Address> leadAddress) {
        Lead lead = leadRepository.findByUuid(leadUUID)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadUUID));

        List<Address> addresses = leadAddressRepository.findByLeadId(lead.getId());
        if(addresses.isEmpty()){
            addresses = new ArrayList<>();
        }
        for(Address address:leadAddress){
            Optional<Address> existingAddress = addresses.stream()
                    .filter(x -> x.getType().equals(address.getType()))
                    .findFirst();
            if(existingAddress.isPresent()){
                NullAwareBeanUtilsBean.copyNonNullProperties(address, existingAddress.get());
                continue;
            }
            address.setLead(lead);
            addresses.add(address);
        }
        leadAddressRepository.saveAll(addresses);
        return addresses;
    }
}
