package com.leadonboardingservice.leadonboardingservice;

import com.leadonboardingservice.leadonboardingservice.config.SpringContext;
import com.leadonboardingservice.leadonboardingservice.externals.EncryptionServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.DecryptionResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.EncryptedDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.EncryptionResponse;
import com.leadonboardingservice.leadonboardingservice.helpers.EncryptionHelper;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertNotNull;

/** Unit Test for pii encrypt and decrypt method */
//@RunWith(SpringRunner.class)
//@SpringBootTest
@RunWith(MockitoJUnitRunner.class)
public class PIITests {

    @Mock private EncryptionHelper encryptionHelper;
    @Mock private EncryptionServiceApiHelper encryptionServiceApiHelper;
    @Mock private HashGenerator hashGenerator;
    @Mock private GenericRestClient encryptionClient;
    @Mock private RestTemplate restTemplate;

    private MockedStatic<SpringContext> springContextMockedStatic;

    private final String MOBILE_ENCRYPTED_TEST_VALUE = "634f0cc6edd44ea884365ec3";
    private final String MOBILE_DECRYPTED_TEST_VALUE = "7786543216";
    private final String MOBILE_HASH_TEST_VALUE = "1a05bf4a296905bf4778ba4f130ee264eb933961490945132a75356b981ac1ec";
    private final String MOBILE_MASKED_TEST_VALUE = "77XXXXXXXX6";
    private final String EMAIL_ENCRYPTED_TEST_VALUE = "634f0cc6edd44ea884365ecb";
    private final String EMAIL_DECRYPTED_TEST_VALUE = "leadtesting@gmail.com";
    private final String EMAIL_HASH_TEST_VALUE = "09783a926921bb2388bb9f157f5c7cbcd0f7b44e684f53d555ed97fe240be1e3";
    private final String EMAIL_MASKED_TEST_VALUE = "leaXXXXXXXXin@gmail.com";

    @After
    public void after(){
        springContextMockedStatic.close();
    }

    @Before
    public void setUp() {
        encryptionClient = new GenericRestClient(restTemplate);
        encryptionServiceApiHelper = new EncryptionServiceApiHelper(encryptionClient);
        encryptionHelper = new EncryptionHelper(encryptionServiceApiHelper, hashGenerator);
        mockApplicationContextGetBean();
    }

    @Test
    public void piiTest() throws Exception {
        mockDependenciesForEncryption();
        Lead lead = new Lead();
        lead.setMobileDecrypted(MOBILE_DECRYPTED_TEST_VALUE);
        lead.setEmailDecrypted(EMAIL_DECRYPTED_TEST_VALUE);
    
        //method to test. successful execution would add encrypted, masked and hashed values of the decrypted field 
        lead.addPiiFields();

        assertNotNull(lead.getEmailEncrypted());
        assertNotNull(lead.getEmailMasked());
        assertNotNull(lead.getEmailHashed());
        assertNotNull(lead.getMobileMasked());
        assertNotNull(lead.getMobileHashed());
        assertNotNull(lead.getMobileEncrypted());

    }
    
    @Test
    public void decryptionTest() throws Exception {
        mockDependenciesForDecryption();
        Lead lead = new Lead();
        lead.setMobileEncrypted(MOBILE_ENCRYPTED_TEST_VALUE);
        lead.setEmailEncrypted(EMAIL_ENCRYPTED_TEST_VALUE);

        lead.decryptAllPiiFields();

        assertNotNull("email not decrypted",lead.getEmailDecrypted());
        assertNotNull("mobile not decrypted",lead.getMobileDecrypted());
    }

    private void mockDependenciesForDecryption() {
        //mockApplicationContextGetBean();
        mockDecryptionServiceResponse();
    }

    private void mockDecryptionServiceResponse() {
        DecryptionResponseDto decryptionResponseDto = new DecryptionResponseDto();
        Map<String, DecryptionResponseDto.DecryptionResponse> responseMap = new HashMap<>();

        DecryptionResponseDto.DecryptionResponse mobileDecryptionResponse = new DecryptionResponseDto.DecryptionResponse();
        mobileDecryptionResponse.setDecrypted(MOBILE_DECRYPTED_TEST_VALUE);
        mobileDecryptionResponse.setMasked(MOBILE_MASKED_TEST_VALUE);

        DecryptionResponseDto.DecryptionResponse emailDecryptionResponse = new DecryptionResponseDto.DecryptionResponse();
        emailDecryptionResponse.setDecrypted(EMAIL_DECRYPTED_TEST_VALUE);
        emailDecryptionResponse.setMasked(EMAIL_MASKED_TEST_VALUE);

        responseMap.put(MOBILE_ENCRYPTED_TEST_VALUE,mobileDecryptionResponse);
        responseMap.put(EMAIL_ENCRYPTED_TEST_VALUE,emailDecryptionResponse);

        decryptionResponseDto.setData(responseMap);

        ResponseEntity<DecryptionResponseDto> responseEntity = new ResponseEntity<>(decryptionResponseDto, HttpStatus.OK);
        Mockito.when(restTemplate.exchange(Mockito.endsWith("/decrypt"),
                        Mockito.eq(HttpMethod.POST),
                        Mockito.any(),
                        Mockito.eq(DecryptionResponseDto.class)))
                .thenReturn(responseEntity);
    }

    private void mockDependenciesForEncryption() {
        //mockApplicationContextGetBean();
        mockEncryptionServiceResponse();
        mockHashGeneratorResponse();
    }

    private void mockHashGeneratorResponse() {
        Mockito.when(hashGenerator.generate(Mockito.any()))
                .thenReturn(MOBILE_HASH_TEST_VALUE);
    }

    private void mockEncryptionServiceResponse() {
        EncryptionResponse encryptionResponse = new EncryptionResponse();
        List<EncryptedDto> encryptedDtoList = new ArrayList<>();
        EncryptedDto mobileEncryptedDto = new EncryptedDto();
        mobileEncryptedDto.setEncrypted(MOBILE_ENCRYPTED_TEST_VALUE);
        mobileEncryptedDto.setData(MOBILE_DECRYPTED_TEST_VALUE);
        mobileEncryptedDto.setMasked(MOBILE_MASKED_TEST_VALUE);
        EncryptedDto emailEncryptedDto = new EncryptedDto();
        emailEncryptedDto.setData(EMAIL_DECRYPTED_TEST_VALUE);
        emailEncryptedDto.setEncrypted(EMAIL_ENCRYPTED_TEST_VALUE);
        emailEncryptedDto.setMasked(EMAIL_MASKED_TEST_VALUE);
        encryptedDtoList.add(mobileEncryptedDto);
        encryptedDtoList.add(emailEncryptedDto);
        encryptionResponse.setData(encryptedDtoList);
        ResponseEntity<EncryptionResponse> responseEntity = new ResponseEntity<>(encryptionResponse, HttpStatus.OK);
        Mockito.when(restTemplate.exchange(Mockito.endsWith("/encrypt"),
                Mockito.eq(HttpMethod.POST),
                Mockito.any(),
                Mockito.eq(EncryptionResponse.class)))
                .thenReturn(responseEntity);
    }

    private void mockApplicationContextGetBean() {
        springContextMockedStatic = Mockito.mockStatic(SpringContext.class);
        springContextMockedStatic
                .when(() -> SpringContext.getBean(EncryptionHelper.class))
                .thenReturn(encryptionHelper);
    }
}
