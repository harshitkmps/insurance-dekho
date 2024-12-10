package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadProfileDto;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.EncryptionServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.EncryptionRequest;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.EncryptionResponse;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicatePanValidator implements ConvertLeadValidator{
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final LeadProfileRepository leadProfileRepository;
    private final HashGenerator hashGenerator;
    private final EncryptionServiceApiHelper encryptionServiceApiHelper;

    @Override
    public Optional<String> validate(Lead lead) {
        log.info("checking for duplicate pan in CPS for lead {}", lead.getUuid());
        lead.getLeadProfile().decryptAllPiiFields();
        if(StringUtils.isEmpty(lead.getLeadProfile().getPanEncrypted())) { return Optional.empty();}
        Optional<ChannelPartnerDto> channelPartnerDto = channelPartnerServiceApiHelper
                    .getByPanNumber(lead.getLeadProfile().getPanEncrypted());
        if (channelPartnerDto.isPresent()) {
            return Optional
                    .of("a pos account already exists with same pan: " + lead.getLeadProfile().getPanDecrypted());
        }
        return Optional.empty();
    }

    @SneakyThrows
    public Optional<String> validate(String leadId, LeadProfileDto leadProfileDto) {
        if(leadProfileDto.getPan() == null){
            return Optional.empty();
        }
        log.info("checking for duplicate pan in lead table for lead {} pan {}",leadId,leadProfileDto.getPan());
        String panHashed = hashGenerator.generate(leadProfileDto.getPan());
        List<LeadProfile> leadProfileList = leadProfileRepository.findByPanHashed(panHashed);
        //Should leadId be returned in message
        if (!leadProfileList.isEmpty()) {
            Lead lead = leadProfileList.get(0).getLead();
            if (!lead.getUuid().equalsIgnoreCase(leadId)) {
                Long displayLeadId = lead.getId();
                if (lead.getOldLeadId() != null) {
                    displayLeadId = lead.getOldLeadId();
                }
                return Optional.of(
                        "lead already exists with same pan: " + leadProfileDto.getPan() + ". LeadId: " + displayLeadId);
            }
        }
        EncryptionResponse encryptionResponse = encryptionServiceApiHelper
                .encrypt(EncryptionRequest.builder().data(Arrays.asList(leadProfileDto.getPan())).build());
        String panEncrypted = encryptionResponse.getData().get(0).getEncrypted();
        log.info("checking for duplicate pan in CPS for lead {} for pan {}", leadId, leadProfileDto.getPan());
        Optional<ChannelPartnerDto> channelPartnerDto = channelPartnerServiceApiHelper
                .getByPanNumber(panEncrypted);
        if (channelPartnerDto.isPresent()) {
            return Optional.of("a pos account already exists with same pan: " + leadProfileDto.getPan());
        }
        return Optional.empty();
    }
}
