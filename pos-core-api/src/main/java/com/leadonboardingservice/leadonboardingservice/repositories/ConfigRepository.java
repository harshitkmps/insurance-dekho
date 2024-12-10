package com.leadonboardingservice.leadonboardingservice.repositories;
import com.leadonboardingservice.leadonboardingservice.models.Config;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
public interface ConfigRepository extends CrudRepository<Config, String> {
    List<Config> findByConfigName(String configName);
}
