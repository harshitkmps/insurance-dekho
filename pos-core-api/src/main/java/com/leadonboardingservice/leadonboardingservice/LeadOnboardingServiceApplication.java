package com.leadonboardingservice.leadonboardingservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.Properties;

@SpringBootApplication
@EnableAutoConfiguration
@EnableMongoRepositories
@EnableCaching
@EnableTransactionManagement
@OpenAPIDefinition(
		servers = {
				@Server(url = "/", description = "Default Server URL")
		}
)
@SecurityScheme(name = "los-api", scheme = "bearer", bearerFormat = "JWT" , type = SecuritySchemeType.HTTP, in = SecuritySchemeIn.HEADER)
//@ComponentScan({"com.poscoreapi.leadonboardingservice", "com.poscoreapi.leadonboardingservice.repositories"})
public class LeadOnboardingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LeadOnboardingServiceApplication.class, args);
	}

	@Autowired
	private Properties properties;

	@Autowired
	void contributeToPropertySources(ConfigurableEnvironment environment){
		environment.getPropertySources();
	}

}
