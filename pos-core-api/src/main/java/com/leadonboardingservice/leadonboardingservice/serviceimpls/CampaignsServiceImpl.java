package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.fasterxml.jackson.databind.JsonNode;
import com.leadonboardingservice.leadonboardingservice.dtos.LeadAdditionalDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.LeadSource;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadAdditionalDetailsRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginChannels;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginMethods;
import com.leadonboardingservice.leadonboardingservice.exceptions.CampaignException;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.FacebookCampaignsServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.FacebookLeadResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.FacebookPostRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.CreateLeadResponseDto;
import com.leadonboardingservice.leadonboardingservice.services.CampaignsService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class CampaignsServiceImpl implements CampaignsService {

    private final FacebookCampaignsServiceApiHelper facebookCampaignsServiceApiHelper;

    private final GenericRestClient restClient;
    @Value("${losBaseUrl}")
    private String losBaseUrl;

    @Override
    public List<CreateLeadResponseDto> onboardFacebookLead(FacebookPostRequestDto requestDto) {
        log.info("processing request for lead creation");
        List<CreateLeadResponseDto> response = new ArrayList<>();
        if(requestDto.getEntry() == null){
            return response;
        }
        requestDto.getEntry()
                .forEach(entry -> entry.getChanges()
                        .forEach(change -> processFBLead(change).ifPresent(response::add)));
        return response;
    }

    private Optional<CreateLeadResponseDto> processFBLead(FacebookPostRequestDto.LeadGenChangeDTO change) {
        try {
            long leadgenId = change.getValue().getLeadgenId();
            FacebookLeadResponseDto facebookLeadResponseDto = facebookCampaignsServiceApiHelper.getLeadData(leadgenId);
            return Optional.ofNullable(createLeadAndAddAdditionalDetails(facebookLeadResponseDto));
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error while adding lead from campaign {}",e.getMessage());
        }
        return Optional.empty();
    }

    @SneakyThrows
    public CreateLeadResponseDto createLeadAndAddAdditionalDetails(FacebookLeadResponseDto facebookLeadResponseDto) {
        CreateLeadResponseDto createLeadResponseDto = createLead(facebookLeadResponseDto);
        try {
            addAdditionalDetails(createLeadResponseDto,facebookLeadResponseDto);
        }catch (Exception e){
            e.printStackTrace();
            throw new CampaignException("Error in AddAdditionalDetails from FB with id "+ facebookLeadResponseDto.getId() + " : " +e.getMessage());
        }

        return createLeadResponseDto;
    }

    private CreateLeadResponseDto createLead(FacebookLeadResponseDto facebookLeadResponseDto) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setUrl( losBaseUrl + "/api/v1/leads");
        requestDetails.setMethod(HttpMethod.POST);
        requestDetails.setHeaders(headers);
        CreateLeadRequestDto leadRequestDto = buildCreateLeadRequestDto(facebookLeadResponseDto);
        JsonNode jsonNode = restClient.execute(requestDetails, leadRequestDto, JsonNode.class);
        String uuid = jsonNode.get("data").get("uuid").asText();
        return CreateLeadResponseDto
                .builder()
                .uuid(uuid)
                .build();
    }

    private void addAdditionalDetails(CreateLeadResponseDto createLeadResponseDto, FacebookLeadResponseDto facebookLeadResponseDto) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setHeaders(headers);
        requestDetails.setUrl(losBaseUrl + "/api/v1/leads/additional-details/" + createLeadResponseDto.getUuid());
        requestDetails.setMethod(HttpMethod.PUT);

        LeadAdditionalDetailsRequestDto additionalDetailsRequestDto = buildAdditionalDetailsRequestDto(facebookLeadResponseDto);
        restClient.execute(requestDetails, additionalDetailsRequestDto, String.class);
    }

    @SneakyThrows
    public CreateLeadRequestDto buildCreateLeadRequestDto(FacebookLeadResponseDto facebookLeadResponseDto) {
        LeadSource leadSource = LeadSource
                .builder()
                .utmMedium(facebookLeadResponseDto.getUtmMedium("utm_medium"))
                .utmSource(facebookLeadResponseDto.getValue("utm_source"))
                .utmCampaign(facebookLeadResponseDto.getUtmCampaign("utm_campaign"))
                .build();

        return CreateLeadRequestDto
                .builder()
                .name(facebookLeadResponseDto.getValue("full_name"))
                .mobile(facebookLeadResponseDto.getValue("phone_number").substring(facebookLeadResponseDto.getValue("phone_number").length() - 10))
                .email(facebookLeadResponseDto.getValue("email"))
                .leadOrigin(LeadOriginChannels.CAMPAIGNS)
                .leadOriginMethods(LeadOriginMethods.SELF)
                .leadSource(leadSource)
                .tenantId(1L)
                .build();
    }

    @SneakyThrows
    public LeadAdditionalDetailsRequestDto buildAdditionalDetailsRequestDto(FacebookLeadResponseDto facebookLeadResponseDto) {
        List<LeadAdditionalDetailsDto> additionalDetailsDtos = new ArrayList<>();

        LeadAdditionalDetailsDto isExperienced = new LeadAdditionalDetailsDto();
        isExperienced.setName("isExperienced");
        if(facebookLeadResponseDto.getValue("do_you_have_experience_in_selling_insurance?").equals("yes_"))
            isExperienced.setValue("1");
        else
            isExperienced.setValue("0");

        additionalDetailsDtos.add(isExperienced);

        LeadAdditionalDetailsDto isInterested = new LeadAdditionalDetailsDto();
        isInterested.setName("isInterested");
        if(facebookLeadResponseDto.getValue("are_you_interested_in_selling_insurance?").equals("yes"))
            isInterested.setValue("1");
        else
            isInterested.setValue("0");


        additionalDetailsDtos.add(isInterested);

        LeadAdditionalDetailsRequestDto leadAdditionalDetailsRequestDto = new LeadAdditionalDetailsRequestDto();
        leadAdditionalDetailsRequestDto.setData(additionalDetailsDtos);

        return leadAdditionalDetailsRequestDto;
    }

}
