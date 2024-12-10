package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.Remarks;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface RemarksRepository extends CrudRepository<Remarks, Long> {
    List<Remarks> findByCategory(String category);
}
