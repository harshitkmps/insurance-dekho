/*
package com.leadonboardingservice.leadonboardingservice.serviceImpls;

import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.IAMServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.SalesProfileServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.*;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@Service
public class IAMService {

    private final IAMServiceApiHelper iamServiceApiHelper;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final SalesProfileServiceApiHelper salesProfileServiceApiHelper;
    private final LeadRepository leadRepository;

    public String fetchIamUUID(String name, String email, String mobile, Long tenantId, String referAuthId){
        IAMRequestDto iamRequestDto = IAMRequestDto.builder()
                .mobile(mobile)
                .name(name)
                .email(email)
                .status(1)
                .tenantId(tenantId)
                .referenceAuthId(referAuthId)
                .build();
        IAMResponseDto responseDto = iamServiceApiHelper.fetchUser(iamRequestDto);
        if (responseDto.getStatus().equalsIgnoreCase("T")){
            if(checkIfProspect(responseDto.getData().getUuid())){
                log.info("deleting lead in iam with uuid {}",responseDto.getData().getUuid());
                IAMUpdateRequestDto iamUpdateRequestDto = IAMUpdateRequestDto.builder().isDeleted(1).build();
                iamServiceApiHelper.updateUser(iamUpdateRequestDto,responseDto.getData().getUuid());
            }
        }
    }

    private boolean checkIfProspect(String uuid) {
        if(leadRepository.findByUuid(uuid).isPresent()){
            log.info("lead found by uuid {}",uuid);
            return false;
        }
        try {
            ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(uuid);
            return false;
        } catch (Exception e){
            log.info("channel partner not found for uuid {}",uuid);
        }
        try{
            SalesPersonDto salesPersonDto = salesProfileServiceApiHelper.getBySalesPersonIamId(uuid);
            return false;
        } catch (Exception e){
            log.info("sales profile not found for uuid {}", uuid);
        }
        return true;
    }
}
*/
