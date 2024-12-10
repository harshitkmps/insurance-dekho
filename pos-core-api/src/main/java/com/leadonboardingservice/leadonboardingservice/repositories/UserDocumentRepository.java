package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.UserDocument;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface UserDocumentRepository extends CrudRepository<UserDocument,Long> {
    List<UserDocument> findByUserIdAndStatusNot(Long id, int status);
    List<UserDocument> findByIamUuidAndStatusNot(String uuid, int status);
}
