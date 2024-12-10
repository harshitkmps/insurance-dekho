package com.leadonboardingservice.leadonboardingservice.dtos.response;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.List;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IRDAIRegistrationResponse {
    private List<PanInfo> data;
    private String message;
    private int status;
    public static class PanInfo {
        @JsonProperty("panNo")
        private String panNo;
        @JsonProperty("message")
        private String message;
        @Getter
        @JsonProperty("isPanPresent")
        private int isPanPresent;
    }
}
