package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends CrudRepository<User,Long> {
    List<User> findByIrdaId(String irdaId);

    Optional<User> findByUuid(String uuid);
    @Query(value = "SELECT user_id FROM tbl_user WHERE uuid = ?1 AND is_active = '0'", nativeQuery = true)
    Optional<User> findInactiveUserByUuid(String uuid);
}
