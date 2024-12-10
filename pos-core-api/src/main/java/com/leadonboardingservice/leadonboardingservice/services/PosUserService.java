package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.User;

import java.util.Optional;

public interface PosUserService {

    //this interface should ideally accept only channelPartnerResponse
    Optional<User> createUserInPos(ChannelPartnerDto channelPartnerResponseDto, Lead lead);

    Optional<User> getUser(Long userId);

    Optional<User> getUserByUUID(String uuid);

    User save(User user);
}
