package com.leadonboardingservice.leadonboardingservice.constants;

public class LeadConstants {

    public static final String UTM_SOURCE = "utmSource";
    public static final String UTM_MEDIUM = "utmMedium";
    public static final String UTM_CAMPAIGN = "utmCampaign";
    public static final String OLD_LEAD_ID = "oldLeadId";

    public static final String LEAD_ASSIGNMENT_EVENT = "LEAD_ASSIGNED";
    public static final int LEAD_EVENT_RETRY_COUNT = 3;
    public static final String IRDA_EXCEP_CONFIG_KEY = "IRDAI_PAN_EXCEP";
    public static final int LEAD_IRDA_EVENT_RETRY_COUNT = 3;
    public static final String LEAD_REJECTION_WITH_ALREADY_REGISTERED_PAN = "Account already registered with PAN";
    public static final String RE_REGISTER = "isReRegister";
    public static final String NOC_REQ = "isNocRequired";
    public static final String OLD_PAN = "existingPan";
    public static final String BENE_NAME_VERIFIED = "isBeneNameVerified";
    public static final String NAME_FROM_AADHAAR = "aadhaarName";
    public static final String GENDER = "gender";

    public static class RejectionReason {
        public static final String PAN_REGISTERED_WITH_IRDAI = "PAN Already Registered with IRDAI";
        public static final String OTHERS = "Others";
        public static final String BENEFICIARY_NAME_CONFLICT = "Beneficiary name mismatch";
    }

    public static class RejectionRemarkId {
        public static final String PAN_REGISTERED_WITH_IRDAI = "24";
        public static final String OTHERS = "25";
        public static final String BENEFICIARY_NAME_CONFLICT = "26";
    }

}