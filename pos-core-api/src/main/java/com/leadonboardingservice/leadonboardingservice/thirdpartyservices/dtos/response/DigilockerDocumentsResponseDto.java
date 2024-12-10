package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import com.leadonboardingservice.leadonboardingservice.models.digilocker.IssuedDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DigilockerDocumentsResponseDto {
    private ArrayList<IssuedDocument> items;
}
