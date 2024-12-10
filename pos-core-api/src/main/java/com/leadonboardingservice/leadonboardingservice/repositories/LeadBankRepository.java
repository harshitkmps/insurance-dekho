package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.BankDetail;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface LeadBankRepository extends CrudRepository<BankDetail,Long> {

    List<BankDetail> findByLeadId(Long leadId);
    Optional<BankDetail> findByAccountNumberHashed(@Param("account_number_hashed") String AccountNumberHashed);
}
