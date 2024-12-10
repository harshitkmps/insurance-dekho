package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.constants.OnboardingConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.AddressDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.AccessTokenRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadDocumentDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.AccessTokenResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.DigilockerDetailsResponseDto;
import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.externals.DocumentServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceResponseDto;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import com.leadonboardingservice.leadonboardingservice.mappers.LeadAddressMapper;
import com.leadonboardingservice.leadonboardingservice.models.Address;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.AadharDetails;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.PanDetails;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.IssuedDocument;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.UidData;
import com.leadonboardingservice.leadonboardingservice.services.DigiLockerService;
import com.leadonboardingservice.leadonboardingservice.services.LeadAddressService;
import com.leadonboardingservice.leadonboardingservice.services.LeadManager;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.DigilockerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.DigilockerDocumentsResponseDto;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Slf4j
public class DigiLockerServiceImpl implements DigiLockerService {

    private final GenericRestClient restClient;
    private final RestTemplate restTemplate;
    private final LeadManager leadManager;
    private final LeadAddressService leadAddressService;
    private final DigilockerServiceApiHelper digilockerServiceApiHelper;
    private final DocumentServiceApiHelper documentServiceApiHelper;
    private final LeadAddressMapper leadAddressMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @SneakyThrows
    @Override
    public AccessTokenResponseDto getAccessToken(String code, String source, String codeVerifier) {
        HttpHeaders headers = new HttpHeaders();
        AccessTokenRequestDto accessTokenRequestDto = AccessTokenRequestDto.builder()
                .clientId(digilockerServiceApiHelper.getClientId(source))
                .clientSecret(digilockerServiceApiHelper.getClientSecret(source))
                .redirectUri(digilockerServiceApiHelper.getRedirectUri(source))
                .code(code)
                .grantType(digilockerServiceApiHelper.getGrantType())
                .codeVerifier(codeVerifier).build();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        Map<String, String> fieldMap = objectMapper.convertValue(accessTokenRequestDto, new TypeReference<Map<String, String>>() {
        });
        map.setAll(fieldMap);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        ResponseEntity<AccessTokenResponseDto> response = restTemplate.postForEntity(digilockerServiceApiHelper.getHost() + digilockerServiceApiHelper.getPath() + "/token", request, AccessTokenResponseDto.class);
        return response.getBody();
    }

    @SneakyThrows
    @Override
    public DigilockerDocumentsResponseDto getIssuedDocuments(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + token);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(digilockerServiceApiHelper.getHost() + "/public/oauth2/2/files/issued")
                .method(HttpMethod.GET)
                .headers(headers)
                .build();
        DigilockerDocumentsResponseDto response = restClient.execute(requestDetails, null, DigilockerDocumentsResponseDto.class);
        return response;
    }

    @SneakyThrows
    public AadharDetails getEaadhar(String token) throws Exception {
        log.info("Fetching Eaadhar for token {}", token);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + token);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(digilockerServiceApiHelper.getHost() + "/public/oauth2/3/xml/eaadhaar")
                .method(HttpMethod.GET)
                .headers(headers)
                .build();
        String response = restClient.execute(requestDetails, null, String.class);
        AadharDetails aadharDetails = (AadharDetails) digilockerServiceApiHelper.ToObject(response, new AadharDetails());
        return aadharDetails;
    }

    @SneakyThrows
    @Override
    public DocumentServiceResponseDto getDocumentFromURI(String token, String uri, String docType) {
        log.info("Inside getDocumentsFromURI");
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + token);
        headers.add("Content-Type", "application/pdf");
        RequestDetails requestDetails = RequestDetails.builder()
                .url(digilockerServiceApiHelper.getHost() + digilockerServiceApiHelper.getPath() + "/file/" + uri)
                .method(HttpMethod.GET)
                .headers(headers)
                .build();
        byte[] data = restClient.execute(requestDetails, null, byte[].class);
        DocumentServiceResponseDto documentServiceResponseDto = new DocumentServiceResponseDto();
        String path = docType + token + OnboardingConstants.PDF_EXTENSION;
        try (OutputStream stream = new FileOutputStream(new ClassPathResource(path).getPath())) {
            stream.write(data);
            documentServiceResponseDto = documentServiceApiHelper.uploadDocument(path);
            log.info("uploaded doc {}", documentServiceResponseDto);
            File file = new File(new ClassPathResource(path).getPath());
            file.delete();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return documentServiceResponseDto;
    }

    public PanDetails getFileDataFromURI(String accessToken, String uri) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(digilockerServiceApiHelper.getHost() + "/public/oauth2/1/xml/" + uri)
                .method(HttpMethod.GET)
                .headers(headers)
                .build();
        String response = restClient.execute(requestDetails, null, String.class);
        PanDetails panDetails = (PanDetails) digilockerServiceApiHelper.ToObject(response, new PanDetails());
        return panDetails;
    }

    @SneakyThrows
    @Override
    public DigilockerDetailsResponseDto fetchDigilockerDetails(AccessTokenResponseDto accessToken, String uuid) throws Exception {
        log.info("Inside fetchDigilockerDetails");
        DigilockerDetailsResponseDto digilockerDetailsResponseDto = new DigilockerDetailsResponseDto();
        ArrayList<LeadDocumentDto> leadDocumentDtoArrayList = new ArrayList<>();

        if (accessToken.getEaadhaar().equals("Y")) {
            try {
                AadharDetails aadharDetails = getEaadhar(accessToken.getAccessToken());
                UidData personalDetails = aadharDetails.getDetails();
                digilockerDetailsResponseDto.setPersonalDetails(personalDetails.getPoi());
                AddressDto addressDto = AddressDto.builder()
                        .type(AddressTypes.HOME)
                        .fullAddress(personalDetails.getPoa().getAddress())
                        .pincode(personalDetails.getPoa().getPc().toString())
                        .cityId(null).stateId(null)
                        .locality(null).build();
                List<Address> addressList = new ArrayList<>();
                addressList.add(leadAddressMapper.toEntity(addressDto));
                leadAddressService.updateLeadAddressDetails(uuid, addressList);
                digilockerDetailsResponseDto.setAddressDetails(addressDto);

                byte[] data = Base64.decodeBase64(personalDetails.getPht());
                DocumentServiceResponseDto photoResponseDto = new DocumentServiceResponseDto();
                String path = OnboardingConstants.PHOTO + uuid + OnboardingConstants.JPG_EXTENSION;
                try (OutputStream stream = new FileOutputStream(new ClassPathResource(path).getPath())) {
                    stream.write(data);
                    photoResponseDto = documentServiceApiHelper.uploadDocument(path);
                    File file = new File(new ClassPathResource(path).getPath());
                    file.delete();
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                LeadDocumentDto userPhoto = LeadDocumentDto.builder()
                        .documentType(DocumentType.USER_PHOTO)
                        .documentId(photoResponseDto.getData().getDocId())
                        .documentSource(DocumentSources.AUTOMATED)
                        .status(DocumentStatus.UPLOADED)
                        .origin(OnboardingConstants.DIGILOCKER).build();
                leadManager.addLeadDocument(uuid, userPhoto);
                leadDocumentDtoArrayList.add(userPhoto);
                digilockerDetailsResponseDto.setMessage("Eaadhar details fetched from the account");
            } catch (Exception err) {
                err.printStackTrace();
            }
        } else {
            digilockerDetailsResponseDto.setMessage("Aadhaar is not linked to the account");
        }
        List<IssuedDocument> items;
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        ArrayList<String> docTypeList = new ArrayList<>(Arrays.asList(OnboardingConstants.PANCR, OnboardingConstants.SPCER));
        try {
            DigilockerDocumentsResponseDto issuedDocuments = getIssuedDocuments(accessToken.getAccessToken());
            log.info("Issued Documents {}", issuedDocuments);
            items = issuedDocuments.getItems();
            items.forEach(i -> {
                final CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    try {
                        if (docTypeList.contains(i.getDoctype())) {
                            DocumentServiceResponseDto documentServiceResponseDto = getDocumentFromURI(accessToken.getAccessToken(), i.getUri(), i.getDoctype());
                            if (documentServiceResponseDto != null) {
                                LeadDocumentDto leadDocumentDto = new LeadDocumentDto();
                                leadDocumentDto.setDocumentId(documentServiceResponseDto.getData().getDocId());
                                leadDocumentDto.setDocumentSource(DocumentSources.AUTOMATED);
                                leadDocumentDto.setStatus(DocumentStatus.UPLOADED);
                                leadDocumentDto.setDocumentType(digilockerServiceApiHelper.mapDocType(i.getDoctype()));
                                leadDocumentDto.setOrigin(OnboardingConstants.DIGILOCKER);
                                leadDocumentDtoArrayList.add(leadDocumentDto);
                            }
                        }
                    } catch (Exception e) {
                        log.error("Get Document From URI Exception {}", e.getMessage());
                        e.printStackTrace();
                    }
                });
                futures.add(future);
            });
            futures.stream()
                    .map(CompletableFuture::join)
                    .collect(Collectors.toList());
            digilockerDetailsResponseDto.setDocumentDetails(leadDocumentDtoArrayList);

            leadDocumentDtoArrayList.forEach(leadDocumentDto -> {
                leadManager.addLeadDocument(uuid, leadDocumentDto);
            });

            return digilockerDetailsResponseDto;
        } catch (Exception err) {
            err.printStackTrace();
            throw new RuntimeException("unable to fetch Issued Documents " + err.getMessage());
        }


    }

}

