package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.externals.BrokerageMasterApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.BrokerageAreaResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.repositories.UserDocumentRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.UserRepository;
import com.leadonboardingservice.leadonboardingservice.services.PosUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class PosUserServiceImpl implements PosUserService {
    private final UserRepository userRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final BrokerageMasterApiHelper brokerageMasterApiHelper;

    @Override
    public Optional<User> createUserInPos(ChannelPartnerDto channelPartnerResponse, Lead lead) {
        log.info("creating user in pos for channelPartnerId {} dealerId {} gcdCode {} leadId {}", channelPartnerResponse.getChannelPartnerId(), channelPartnerResponse.getDealerId(), channelPartnerResponse.getGcdCode(), lead.getUuid());
        Optional<BankDetail> optionalBankDetail = getActiveBankDetail(lead.getBankDetails());
        optionalBankDetail.ifPresent(BaseEntity::decryptAllPiiFields);
        BankDetail bankDetail = optionalBankDetail.get();
        User user = User.builder()
                .uuid(channelPartnerResponse.getIamUUID())
                .isQcBypass(1)
                .roleId(3)
                .status(3)
                .isActive("1")
                .businessUnitId(2)
                .added(LocalDateTime.now())
                .modified(LocalDateTime.now())
                .address(channelPartnerResponse.getAddress())
                .channel_partner_id(channelPartnerResponse.getChannelPartnerId())
                .cityId(channelPartnerResponse.getCityId())
                .stateId(channelPartnerResponse.getStateId())
                .communicationStatus(0)
                .dealerCityId(channelPartnerResponse.getCityId())
                .dateOfBirth(lead.getLeadProfile().getDateOfBirth())
                .gender(channelPartnerResponse.getGender())
                .dealerOrganization(channelPartnerResponse.getOrganization())
                .firstName(channelPartnerResponse.getName())
                .userName(channelPartnerResponse.getName())
                .dealerId(Long.valueOf(channelPartnerResponse.getDealerId()))
                .gcdCode(channelPartnerResponse.getGcdCode())
                .irdaId(channelPartnerResponse.getIrdaId())
                .irdaReportingDate(lead.getIrdaReportingDate())
                .leadId(lead.getId())
                .tenantId(channelPartnerResponse.getTenantId())
                .source(channelPartnerResponse.getChannelPartnerType())
                .syncDate(LocalDateTime.now())
                .onboardedOnGeneral(channelPartnerResponse.getOnBoardedOnGeneral())
                .onboardedOnLife(channelPartnerResponse.getOnBoardedOnLife())
                .pincode(Integer.valueOf(channelPartnerResponse.getPinCode()))
                .build();
        if (channelPartnerResponse.getReferrerId() != null && channelPartnerResponse.getReferrerId() != 0) {
            user.setReferDealerId(String.valueOf(channelPartnerResponse.getReferrerId()));
        }
        if (lead.getAddress() != null) {
            Optional<Address> workAddress = lead.getAddress().stream().filter(x -> x.getType().equals(AddressTypes.WORK)).findFirst();
            if (workAddress.isPresent()) {
                user.setLocality(workAddress.get().getLocality());
            }
        }
        if (StringUtils.isEmpty(channelPartnerResponse.getIrdaId())) {
            user.setEligibleForGeneral(true);
        }
        try {
            log.info("fetching city and state name for pincode {} ", user.getPincode());
            BrokerageAreaResponseDto.BrokerageAreaDto brokerageAreaDto = brokerageMasterApiHelper.getAreaDetailsByPinCode(String.valueOf(user.getPincode()));
            user.setCityName(brokerageAreaDto.getCityName());
            user.setStateName(brokerageAreaDto.getStateName());
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error fetching city/state name for pincode {}", user.getPincode());
        }

        Optional<User> optionalUser = userRepository.findInactiveUserByUuid(lead.getUuid());
        optionalUser.ifPresent(value -> user.setId(value.getId()));
        userRepository.save(user);
        addUserDocuments(user, lead);
        return Optional.of(user);
    }

    private void addUserDocuments(User user, Lead lead) {
        log.info("adding user documents for lead {}", lead.getUuid());
        List<UserDocument> finalUserDocumentsList = new ArrayList<>();
        List<UserDocument> userDocumentsList = userDocumentRepository.findByUserIdAndStatusNot(user.getId(), 0);
        List<UserDocument> userCertificatesList = userDocumentRepository.findByIamUuidAndStatusNot(user.getUuid(), 0);

        if (userDocumentsList != null && !userDocumentsList.isEmpty()) {
            finalUserDocumentsList.addAll(userDocumentsList);
        }
        if (userCertificatesList != null && !userCertificatesList.isEmpty()) {
            finalUserDocumentsList.addAll(userCertificatesList);
        }
        if (!finalUserDocumentsList.isEmpty()) {
            finalUserDocumentsList.forEach(doc -> doc.setStatus(0));
        }
        if (lead.getDocuments() != null) {
            lead.getDocuments().forEach(x -> {
                String filePath = "";
                if (x.getUrl() != null) {
                    filePath = x.getUrl();
                }
                UserDocument userDocument = UserDocument.builder()
                        .userId(user.getId())
                        .iamUuid(lead.getUuid())
                        .documentType(getDocType(x.getType()))
                        .docId(x.getDocumentId())
                        .fileName("")
                        .filePath(filePath)
                        .status(1)
                        .build();
                finalUserDocumentsList.add(userDocument);
            });
        }
        userDocumentRepository.saveAll(finalUserDocumentsList);
    }

    private String getDocType(DocumentType type) {
        if (type.equals(DocumentType.PAN)) {
            return "pan";
        }
        if (type.equals(DocumentType.AADHAAR_FRONT)) {
            return "aadhar_front";
        }
        if (type.equals(DocumentType.AADHAAR_BACK)) {
            return "aadhar_back";
        }
        if (type.equals(DocumentType.EDUCATION_CERTIFICATE)) {
            return "x_certificate";
        }
        if (type.equals(DocumentType.CANCELLED_CHEQUE)) {
            return "cancel_cheque";
        }
        if (type.equals(DocumentType.USER_PHOTO)) {
            return "photo";
        }
        if (type.equals(DocumentType.PAN_NOC)) {
            return "pan_noc";
        }
        return "";
    }

    @Override
    public Optional<User> getUser(Long userId) {
        log.info("finding user by id {}", userId);
        return userRepository.findById(userId);
    }

    @Override
    public Optional<User> getUserByUUID(String uuid) {
        return userRepository.findByUuid(uuid);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    private Optional<BankDetail> getActiveBankDetail(List<BankDetail> bankDetailList) {
        return bankDetailList.stream().filter(x -> x.getIsActive() && x.getIsBankVerified()).findFirst();
    }
}
