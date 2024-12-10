package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.MetaData;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChannelPartnerResponseDto {

    private MetaData meta;
    private ChannelPartnerDto data;
}
