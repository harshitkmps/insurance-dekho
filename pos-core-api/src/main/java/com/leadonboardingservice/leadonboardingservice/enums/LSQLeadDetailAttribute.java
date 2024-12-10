package com.leadonboardingservice.leadonboardingservice.enums;

public enum LSQLeadDetailAttribute {
    MX_CITY("mx_city"), MX_UUID("mx_UUID"), MX_GCD_CODE("mx_GCD_Code"), FIRST_NAME("FirstName"), EMAIL("EmailAddress"),
    Phone("Phone"), MX_STATE("mx_State"), SOURCE("Source") ,CAMPAIGN("SourceCampaign"), MEDIUM("SourceMedium"), MX_POS_ORIGIN("mx_POS_Origin"), MX_LEAD_ID("mx_Lead_ID"),
    CREATED_BY_NAME("CreatedByName"), MX_ASSIGNED_RM_UUID("mx_Assigned_RM_UUID"), PROSPECT_STAGE("ProspectStage"),
    REJECTION_REMARK("mx_Lead_Remarks"),

    AADHAAR_FRONT("Status"), AADHAAR_BACK("mx_Custom_5"), PAN("mx_Custom_2"), USER_PHOTO("mx_Custom_3"),
    EDUCATION_CERTIFICATE("mx_Custom_1"), BANK_DETAILS("mx_Custom_4"),

    RM_FLOW("RM_FLOW"), SELF("Self")
    ;

    private final String attribute;
    LSQLeadDetailAttribute(String attribute) {
        this.attribute = attribute;
    }

    public static String getSchemaName(String type) {
        if(type.equals(AADHAAR_FRONT.toString())){
            return AADHAAR_FRONT.attribute;
        }
        if(type.equals(AADHAAR_BACK.toString())){
            return AADHAAR_BACK.attribute;
        }
        if(type.equals(PAN.toString())){
            return PAN.attribute;
        }
        if(type.equals(EDUCATION_CERTIFICATE.toString())){
            return EDUCATION_CERTIFICATE.attribute;
        }
        if(type.equals(USER_PHOTO.toString())) {
            return USER_PHOTO.attribute;
        }
        throw new RuntimeException("invalid document type"+type);
    }

    public String getAttribute() {
        return attribute;
    }
}
