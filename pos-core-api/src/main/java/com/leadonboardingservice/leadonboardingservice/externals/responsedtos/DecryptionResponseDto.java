package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DecryptionResponseDto {

    @JsonProperty("data")
    Map<String, DecryptionResponse> data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DecryptionResponse {
        @JsonProperty("decrypted")
        private String decrypted;
        @JsonProperty("masked")
        private String masked;
    }
}
