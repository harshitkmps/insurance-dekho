package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.enums.InsuranceProduct;
import com.leadonboardingservice.leadonboardingservice.enums.TrainingStatuses;
import com.leadonboardingservice.leadonboardingservice.models.LeadTraining;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;


import java.util.List;

public interface LeadTrainingRepository extends CrudRepository<LeadTraining,Long> {
    @Query( nativeQuery = true, value = "select * from lead_training lt where lt.status = :trainingStatus AND lt.created_at <= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL :timeInterval HOUR)")
    List<LeadTraining> findByStatus(@Param("trainingStatus") String trainingStatus, @Param("timeInterval") Integer timeInterval);
}
