package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.models.BankDetail;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadBankRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadBankService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeadBankServiceImpl implements LeadBankService {

    private final LeadBankRepository bankRepository;
    private final LeadRepository leadRepository;

    @Override
    public BankDetail updateLeadBankDetails(String leadUUID, BankDetail bankDetail) {
        Lead lead = leadRepository.findByUuid(leadUUID)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadUUID));
        bankDetail.setLead(lead);
        List<BankDetail> existingBankDetailsList = lead.getBankDetails();
        if(existingBankDetailsList == null || existingBankDetailsList.isEmpty()){
            existingBankDetailsList = new ArrayList<>();
            existingBankDetailsList.add(bankDetail);
        } else {
            BankDetail existingBankDetail = existingBankDetailsList.get(0);
            NullAwareBeanUtilsBean.copyNonNullProperties(bankDetail,existingBankDetail);
            if(!existingBankDetail.getAccountNumberHashed().equals(bankDetail.getAccountNumberHashed())
                    || existingBankDetail.getBankName().equals(bankDetail.getBankName()) ||
                    existingBankDetail.getIfsc().equals(bankDetail.getIfsc())){
                log.info("marking isAccountVerified to 0 for lead {}. bank account details changed",leadUUID);
                existingBankDetail.setBeneficiaryId("");
                existingBankDetail.setBeneficiaryName("");
                existingBankDetail.setIsBankVerified(false);
            }
        }
        lead.setBankDetails(existingBankDetailsList);
        //existingBankDetailsList.forEach(x -> x.setIsDeleted(true));
        if(!lead.getStatus().equals(LeadStatus.REGISTERED) &&
                !(lead.getStatus().equals(LeadStatus.REJECTED)  && LeadConstants.RejectionRemarkId.PAN_REGISTERED_WITH_IRDAI.equals(lead.getRejectionRemarksId()))){
            lead.setStatus(LeadStatus.CREATED);
        }
        bankRepository.saveAll(existingBankDetailsList);
        return bankDetail;
    }
}
