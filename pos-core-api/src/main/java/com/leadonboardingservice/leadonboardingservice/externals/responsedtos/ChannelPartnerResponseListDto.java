package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.MetaData;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChannelPartnerResponseListDto {
    private MetaData meta;
    private List<ChannelPartnerDto> data;
}
