package com.leadonboardingservice.leadonboardingservice.dtos;

import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressDto {
    @NotNull
    private AddressTypes type;

    @NotNull
    @NotEmpty
    private String pincode;

    @NotNull
    @NotEmpty
    private String fullAddress;

    private String addressEncrypted;

    private String addressMasked;

    @NotNull
    private Integer cityId;

    @NotNull
    private Integer stateId;

    @NotNull
    @NotEmpty
    private String locality;

    private String gstNumber;

    private Object meta;

    public void setCityId(Integer cityId) {
        if(cityId==0) return;
        this.cityId = cityId;
    }

    public void setStateId(Integer stateId) {
        if(stateId==0) return;
        this.stateId = stateId;
    }
}
