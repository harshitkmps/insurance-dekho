package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadBankDto;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.BankDetail;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadBankRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateBankValidator implements ConvertLeadValidator {

    private final LeadBankRepository leadBankRepository;
    private final HashGenerator hashGenerator;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;

    public Optional<String> validate(String leadUUID, LeadBankDto leadBankDto){
        if(leadBankDto.getAccountNumber() == null){
            return Optional.empty();
        }
        String accountNumberHashed = hashGenerator.generate(leadBankDto.getAccountNumber());
        log.info("checking for duplicate Account in lead bank table for lead {} accountNumber {}",leadUUID,accountNumberHashed);
        Optional<BankDetail> duplicateBank = leadBankRepository.findByAccountNumberHashed(accountNumberHashed);
        if(duplicateBank.isPresent()){
            Lead lead = duplicateBank.get().getLead();
            if(lead.getUuid().equalsIgnoreCase(leadUUID)){
                return Optional.empty();
            }
            Long leadId = lead.fetchId();
            return Optional.of("Bank Details already exists with leadId "+ leadId);
        }
        Optional<ChannelPartnerDto> channelPartnerDto = channelPartnerServiceApiHelper
                .getByAccountNumber(leadBankDto.getAccountNumber());
        if (channelPartnerDto.isPresent()) {
            return Optional
                    .of("a pos account already exists with same account number");
        }
        return Optional.empty();
    }

    @Override
    public Optional<String> validate(Lead lead) {
        log.info("checking for duplicate account number in CPS for lead {}", lead.getUuid());
        Optional<BankDetail> bankDetail = lead.getBankDetails().stream().filter(x -> !x.getIsDeleted()).findFirst();
        if(bankDetail.isEmpty() || bankDetail.get().getAccountNumberEncrypted().isEmpty()) {
            return Optional.empty();
        }
        Optional<ChannelPartnerDto> channelPartnerDto = channelPartnerServiceApiHelper
                .getByAccountNumber(bankDetail.get().getAccountNumberEncrypted());
        if (channelPartnerDto.isPresent()) {
            return Optional
                    .of("a pos account already exists with same account number");
        }
        return Optional.empty();
    }
}
