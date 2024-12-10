package com.leadonboardingservice.leadonboardingservice.helpers;

import com.leadonboardingservice.leadonboardingservice.externals.EncryptionServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.EncryptionRequest;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.DecryptionResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.EncryptedDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.EncryptionResponse;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiTypeAndValue;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiiType;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@Component
public class EncryptionHelper {

    private final EncryptionServiceApiHelper encryptionServiceApiHelper;
    private final HashGenerator hashGenerator;

    @SneakyThrows
    public Map<String, String> encrypt(List<PiTypeAndValue> piTypeAndValueList) {
        List<String> toBeEncryptedData = new ArrayList<>();
        Map<String, String> encryptedValuesMap = new HashMap<>();
        if(piTypeAndValueList.isEmpty()){
            return encryptedValuesMap;
        }
        for(PiTypeAndValue keyValue :  piTypeAndValueList){
            toBeEncryptedData.add(keyValue.getValue());
        }
        EncryptionRequest requestBody = EncryptionRequest.builder().data(toBeEncryptedData).build();
        EncryptionResponse response = encrypt(requestBody);
        List<EncryptedDto> encryptedData = response.getData();
        for(Integer index = 0; index < encryptedData.size(); index++){
            String field = piTypeAndValueList.get(index).getPiType();
            EncryptedDto encryptedDto = encryptedData.get(index);
            encryptedValuesMap.put(field +"_"+PiiType.DECRYPTED.getPiiType(), encryptedDto.getData());
            encryptedValuesMap.put(field +"_" +PiiType.ENCRYPTED.getPiiType(), encryptedDto.getEncrypted());
            encryptedValuesMap.put(field +"_"+ PiiType.MASKED.getPiiType(), encryptedDto.getMasked());
            encryptedValuesMap.put(field+"_"+PiiType.HASHED.getPiiType(),hashGenerator.generate(piTypeAndValueList.get(index).getValue()));
        }
        return encryptedValuesMap;
    }

    EncryptionResponse encrypt(EncryptionRequest encryptionRequest) throws Exception {
        return encryptionServiceApiHelper.encrypt(encryptionRequest);
    }

    public Map<String,String> decrypt(List<PiTypeAndValue> piTypeAndValueList) throws Exception {
        Map<String,String> response = new HashMap<>();
        List<String> toBeDecryptedData = new ArrayList<>();
        piTypeAndValueList.forEach(piTypeAndValue -> toBeDecryptedData.add(piTypeAndValue.getValue()));
        EncryptionRequest encryptionRequest = EncryptionRequest.builder().data(toBeDecryptedData).build();
        DecryptionResponseDto decryptionResponseDto = decrypt(encryptionRequest);
        Map<String, DecryptionResponseDto.DecryptionResponse> decryptionResponseMap = decryptionResponseDto.getData();
        for(PiTypeAndValue piTypeAndValue: piTypeAndValueList){
            String field = piTypeAndValue.getPiType();
            if(decryptionResponseMap.containsKey(piTypeAndValue.getValue())){
                response.put(field,decryptionResponseMap.get(piTypeAndValue.getValue()).getDecrypted());
            }
        }
        return response;
    }

    /*public DecryptionResponseDto decrypt(List<String> request) throws Exception {
        EncryptionRequest encryptionRequest = EncryptionRequest.builder().data(request).build();
        return decrypt(encryptionRequest);
    }*/

    private DecryptionResponseDto decrypt(EncryptionRequest encryptionRequest) throws Exception {
        return encryptionServiceApiHelper.decrypt(encryptionRequest);
    }
}
