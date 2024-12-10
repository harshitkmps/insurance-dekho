package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoDto {

  private UserInfo data;

  @Data
  private static class UserInfo {
    @JsonProperty("user_basic_info")
    private UserBasicInfo userBasicInfo;
  }

  @Data
  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class UserBasicInfo {
    private String uuid;

    private String status;
  }
}
