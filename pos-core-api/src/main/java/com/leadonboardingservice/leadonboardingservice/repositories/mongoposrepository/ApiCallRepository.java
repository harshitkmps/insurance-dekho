package com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository;

import com.leadonboardingservice.leadonboardingservice.models.mongo.ApiCall;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApiCallRepository extends MongoRepository<ApiCall, String> {
}
