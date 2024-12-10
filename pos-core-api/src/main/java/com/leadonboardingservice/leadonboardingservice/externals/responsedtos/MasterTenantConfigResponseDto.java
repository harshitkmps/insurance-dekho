package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MasterTenantConfigResponseDto {
    private TenantConfigResponseDataDto data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TenantConfigResponseDataDto {
        private List<TenantConfigDto> tenant;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TenantConfigDto implements Serializable {
        private Integer id;
        private String uuid;
        private String name;
        private Integer status;
        @JsonProperty("gcd_prefix")
        private String gcdPrefix;
        @JsonProperty("spoc_name")
        private String spocName;
        @JsonProperty("spoc_email")
        private String spocEmail;
        @JsonProperty("spoc_mobile")
        private String spocMobile;
        private String address;
        private Integer disabled;
        private String createdAt;
        private String updatedAt;
        private String slug;
        private String source;
        @JsonProperty("sub_source")
        private String subSource;
        @JsonProperty("login_mode")
        private String loginMode;
    }
}
