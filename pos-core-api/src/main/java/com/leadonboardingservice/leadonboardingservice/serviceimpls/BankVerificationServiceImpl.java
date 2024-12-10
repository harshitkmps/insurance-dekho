package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;
import com.leadonboardingservice.leadonboardingservice.models.Address;
import com.leadonboardingservice.leadonboardingservice.models.BankDetail;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadAdditionalDetails;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadBankRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.BankVerificationAdapterService;
import com.leadonboardingservice.leadonboardingservice.services.BankVerificationService;
import com.leadonboardingservice.leadonboardingservice.services.LeadAdditionalDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class BankVerificationServiceImpl implements BankVerificationService {

    private final LeadRepository leadRepository;
    private final LeadBankRepository bankRepository;
    private final BankVerificationAdapterService bankVerificationAdapterService;
    private final LeadAdditionalDetailsService leadAdditionalDetailsService;

    @Override
    public BankVerificationResponseDto verifyAccount(String leadUUID) throws PennyDropException {
        log.info("verifying bank details for leadId {}", leadUUID);
        Lead lead = leadRepository.findByUuid(leadUUID)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadUUID));
        BankDetail bankDetail = lead.getBankDetails().stream().filter(x -> !x.getIsDeleted()).findFirst()
                .orElseThrow(() -> new RuntimeException("active bank detail not found for leadId "+leadUUID));
        BankVerificationResponseDto response = new BankVerificationResponseDto();
        if (bankDetail.getIsBankVerified()) {
            log.info("bank details already marked verified for lead {}", leadUUID);
            response.setBankVerified(true);
            return response;
        }
        lead.decryptAllPiiFields();
        bankDetail.decryptAllPiiFields();
        String leadAddress = "";
        Optional<Address> address = lead.getAddress().stream()
                .filter(x -> x.getType().equals(AddressTypes.HOME) && !x.getIsDeleted())
                .findFirst();
        if (address.isPresent()) {
            leadAddress = address.get().getAddress();
        }
        BankVerificationRequestDto bankVerificationRequestDto = BankVerificationRequestDto.builder()
                .beneficiaryAccountNumber(bankDetail.getAccountNumberDecrypted())
                .beneficiaryIFSC(bankDetail.getIfsc())
                .beneficiaryName(lead.getName())
                .beneficiaryEmail(lead.getEmailDecrypted())
                .beneficiaryAddress(leadAddress)
                .beneficiaryMobile(lead.getMobileDecrypted())
                .uuid(leadUUID)
                .build();
        log.info("Bank verification Request for leadId" + leadUUID);
        response = bankVerificationAdapterService.verifyAccount(bankVerificationRequestDto);
        bankDetail.setIsBankVerified(response.isBankVerified());
        bankDetail.setBeneficiaryName(response.getBeneNameAtBank());
        List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
        leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.BENE_NAME_VERIFIED, String.valueOf(response.getNameMatch())));
        leadAdditionalDetailsService.addDetails(leadUUID, leadAdditionalDetailsList);
        bankRepository.save(bankDetail);
        return response;
    }
}
