package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.MetaData;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChannelPartnerResponseDataListDto {
  private MetaData meta;
  private DataDto data;

  @Data
  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class DataDto {
    private List<ChannelPartnerDto> data;
  }
}
