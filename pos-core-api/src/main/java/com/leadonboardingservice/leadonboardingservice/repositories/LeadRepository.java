package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.Lead;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LeadRepository extends CrudRepository<Lead, Long> {

    List<Lead> findByEmailHashed(String emailHashed);

    Optional<Lead> findByUuid(String uuid);

    List<Lead> findByCreatedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<Lead> findByUpdatedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<Lead> findByMobileHashedOrEmailHashedOrUuid(String mobileHashed, String emailHashed, String uuid);

    List<Lead> findByMobileHashedOrUuid(String mobileHashed, String uuid);

    List<Lead> findByIrdaId(String irdaId);

    Optional<Lead> findByOldLeadId(Long id);

    List<Lead> findByIdIn(List<Long> ids);
}
