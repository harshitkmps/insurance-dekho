package com.leadonboardingservice.leadonboardingservice.helpers;

import com.leadonboardingservice.leadonboardingservice.constants.ESConstants;
import com.leadonboardingservice.leadonboardingservice.enums.LSQLeadDetailAttribute;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginMethods;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.enums.TrainingStatuses;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ESUtils {
    public static String mapLeadState(LeadStatus status) {
        if(status.equals(LeadStatus.CREATED)){
            return ESConstants.PENDING;
        }
        if(status.equals(LeadStatus.REGISTRATION_REQUESTED)){
            return ESConstants.REG_REQUESTED;
        }
        if(status.equals(LeadStatus.CLOSED)){
            return ESConstants.CLOSE;
        }
        if(status.equals(LeadStatus.REJECTED)){
            return ESConstants.REJECTED;
        }
        if(status.equals(LeadStatus.REGISTERED)){
            return ESConstants.REGISTERED;
        }
        if(status.equals(LeadStatus.DOCUMENTS_REUPLOAD_REQUIRED)){
            return ESConstants.DOC_INVALID;
        }
        if(status.equals(LeadStatus.VERIFIED)){
            return ESConstants.REG_REQUESTED;
        }
        return null;
    }

    public static String mapExamStatus(TrainingStatuses status) {
        if(status.equals(TrainingStatuses.TEST_STARTED)){
            return ESConstants.EXAM_PENDING;
        }
        if(status.equals(TrainingStatuses.TRAINING_MATERIAL_SHARED)){
            return ESConstants.TRAINING_NOT_INITIATED;
        }
        if(status.equals(TrainingStatuses.COMPLETED)){
            return ESConstants.EXAM_CLEARED;
        }
        if(status.equals(TrainingStatuses.TEST_FAILED)){
            return ESConstants.EXAM_FAILED;
        }
        if(status.equals(TrainingStatuses.TRAINING_MATERIAL_DOWNLOADED)){
            return ESConstants.TRAINING_IN_PROGRESS;
        }
        if(status.equals(TrainingStatuses.TEST_LINK_SHARED)){
            return ESConstants.EXAM_PENDING;
        }
        return ESConstants.STUDY_LINK_PENDING;
    }

    public static String mapLeadOrigin(LeadOriginMethods leadOrigin) {
        if(leadOrigin.equals(LeadOriginMethods.SELF)){
            return ESConstants.LEAD_ORIGIN_SELF;
        }
        return ESConstants.LEAD_ORIGIN_RM_FLOW;
    }

    public static String mapLeadStateToLSQ(LeadStatus status) {
        if(status.equals(LeadStatus.CREATED)){
            return "Incomplete Lead";
        }
        if(status.equals(LeadStatus.REGISTRATION_REQUESTED)){
            return "Registration Requested";
        }
        if(status.equals(LeadStatus.CLOSED)){
            return "Closed";
        }
        if(status.equals(LeadStatus.REJECTED)){
            return "Rejected";
        }
        if(status.equals(LeadStatus.REGISTERED)){
            return "Registered";
        }
        if(status.equals(LeadStatus.DOCUMENTS_REUPLOAD_REQUIRED)){
            return "Document Invalid";
        }
        if(status.equals(LeadStatus.VERIFIED)){
            return "Registration Requested";
        }
        return null;
    }

    public static String mapLeadOriginToLSQ(LeadOriginMethods leadOrigin) {
        if(leadOrigin.equals(LeadOriginMethods.SELF)){
            return LSQLeadDetailAttribute.SELF.getAttribute();
        }
        return LSQLeadDetailAttribute.RM_FLOW.getAttribute();
    }
}
