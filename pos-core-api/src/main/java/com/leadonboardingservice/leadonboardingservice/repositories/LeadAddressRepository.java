package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.Address;
import org.springframework.data.repository.CrudRepository;

import java.util.List;


public interface LeadAddressRepository extends CrudRepository<Address,Long> {

    List<Address> findByLeadId(Long leadId);
}
