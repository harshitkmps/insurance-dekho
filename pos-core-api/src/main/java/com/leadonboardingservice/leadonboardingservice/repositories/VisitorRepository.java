package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.Visitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface VisitorRepository extends CrudRepository<Visitor, Long> {
    Page<Visitor> findByAssignedSalesIamUuidAndNameContaining(String salesIamUuid, String name, Pageable pageable);

    List<Visitor> findByMobileHashed(String mobileHashed);

    List<Visitor> findByEmailHashed(String emailHashed);

    Optional<Visitor> findById(String id);
}
