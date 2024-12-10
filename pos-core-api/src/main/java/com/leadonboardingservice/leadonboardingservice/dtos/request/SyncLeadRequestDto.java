package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SyncLeadRequestDto {

    private List<Long> ids;

    private LocalDate from;

    private LocalDate to;

    private boolean syncIamUUID;

    private boolean syncLeadOrigin;

    private boolean syncLeadPiiFields;

    private boolean syncBankPiiFields;

    private boolean syncRejectionRemark;

    private boolean syncLeadData;

    private boolean syncLeadProfileData;

    private boolean syncLeadAddressData;

    private boolean syncLeadBankData;

    private boolean syncLeadFollowUpData;

    private boolean syncLeadDocumentsData;

    private boolean syncLeadTrainingData;
    private boolean onUpdatedAt;
}
