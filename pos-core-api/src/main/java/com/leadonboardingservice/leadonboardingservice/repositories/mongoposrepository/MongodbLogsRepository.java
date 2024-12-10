package com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository;

import com.leadonboardingservice.leadonboardingservice.models.mongo.Logs;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MongodbLogsRepository extends MongoRepository<Logs, String> {

}


