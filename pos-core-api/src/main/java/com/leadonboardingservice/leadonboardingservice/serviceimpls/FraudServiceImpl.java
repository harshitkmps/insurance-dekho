package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.FraudAttributeConstants;
import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.externals.FraudServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.FraudAttributeRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.FraudSearchRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.FraudSearchResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.Address;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@Slf4j
@RequiredArgsConstructor
public class FraudServiceImpl {

    private final FraudServiceApiHelper fraudServiceApiHelper;
    private final List<String> attributeConstants = Arrays.asList(FraudAttributeConstants.MOBILE,FraudAttributeConstants.EMAIL,FraudAttributeConstants.ADDRESS);
    @Value("${ide.fraud.do-validate}")
    private String doValidateFraud;

    public void validateLeadForFraud(Lead lead) throws ValidationException {
        if(!Boolean.parseBoolean(doValidateFraud)){
            return;
        }
        log.info("validating lead for fraud {}", lead.getUuid());
        lead.decryptAllPiiFields();
        List<FraudAttributeRequestDto> fraudSearchRequestDtoList = new ArrayList<>();
        FraudAttributeRequestDto mobileAttributeRequest = FraudAttributeRequestDto.builder()
                .key(FraudAttributeConstants.MOBILE).value(lead.getMobileEncrypted()).isEncrypted(true).build();
        fraudSearchRequestDtoList.add(mobileAttributeRequest);
        FraudAttributeRequestDto emailAttributeRequest = FraudAttributeRequestDto.builder()
                .key(FraudAttributeConstants.EMAIL).value(lead.getEmailEncrypted()).isEncrypted(true).build();
        fraudSearchRequestDtoList.add(emailAttributeRequest);
//        Address field is not reliable for now
//        Optional<Address> homeAddress = lead.getAddress().stream().filter(x -> x.getType().equals(AddressTypes.HOME)).findFirst();
//        if(homeAddress.isPresent()) {
//            FraudAttributeRequestDto homeAddressAttributeRequest = FraudAttributeRequestDto.builder()
//                    .key(FraudAttributeConstants.ADDRESS).value(homeAddress.get().getAddress()).build();
//            fraudSearchRequestDtoList.add(homeAddressAttributeRequest);
//        }
//        Optional<Address> workAddress = lead.getAddress().stream().filter(x -> x.getType().equals(AddressTypes.WORK)).findFirst();
//        if(workAddress.isPresent()) {
//            FraudAttributeRequestDto workAddressAttributeRequest = FraudAttributeRequestDto.builder()
//                    .key(FraudAttributeConstants.ADDRESS).value(workAddress.get().getAddress()).build();
//            fraudSearchRequestDtoList.add(workAddressAttributeRequest);
//        }
        if(lead.getLeadProfile() != null && !StringUtils.isEmpty(lead.getLeadProfile().getPanEncrypted())) {
            FraudAttributeRequestDto panAttributeRequest = FraudAttributeRequestDto.builder()
                    .key(FraudAttributeConstants.PAN).value(lead.getLeadProfile().getPanEncrypted()).isEncrypted(true).build();
            fraudSearchRequestDtoList.add(panAttributeRequest);
        }
        FraudSearchResponseDto fraudSearchResponseDto = fraudServiceApiHelper.searchBlackList(FraudSearchRequestDto.builder().requestDtoList(fraudSearchRequestDtoList).build());
        log.info("fraud search response fro lead {} {}",lead.getUuid(),fraudSearchResponseDto);
        Map<String,String> responseMap = IntStream.range(0,fraudSearchRequestDtoList.size())
                .boxed()
                .collect(Collectors.filtering(i-> fraudSearchResponseDto.getData().get(i).equalsIgnoreCase("true"),
                        Collectors.toMap(i -> fraudSearchRequestDtoList.get(i).getKey(), i ->fraudSearchResponseDto.getData().get(i),(existingValue, newValue) -> existingValue)));
        if(!responseMap.isEmpty()) {
            lead.setStatus(LeadStatus.CLOSED);
            lead.setClosedStatusRemarkId(23);
            throw new ValidationException("fraud alert");
        }

    }
}
