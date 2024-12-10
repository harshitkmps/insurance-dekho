export const mapDocType = {
  PAN: "panImage",
  AADHAAR_FRONT: "aadharImage",
  ADHAAR_BACK: "aadharImage",
  USER_PHOTO: "photoImage",
  EDUCATION_CERTIFICATE: "certificateImage",
};

export const validationErrors = {
  CREATE_IRDA_USER:
    "ERROR: uuid, InternalPOSCode, AppointmentDate are compulsory.",
  REJECT_LEAD:
    "ERROR: uuid, Rejection Reason, Rejection Remarks Id are compulsory.",
};

export const rejectionRemarks = {
  PAN_REGISTERED_WITH_IRDA: "24",
  OTHERS: "25",
  BENEFICIARY_NAME_CONFLICT: "26",
};

export const LeadStatus = {
  CREATED: "CREATED",
  REGISTRATION_REQUESTED: "REGISTRATION_REQUESTED",
  VERIFIED: "VERIFIED",
  DOCUMENTS_REUPLOAD_REQUIRED: "DOCUMENTS_REUPLOAD_REQUIRED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
  REGISTERED: "REGISTERED",
};

export const docRejectMap = {
  15: "Document is not correct",
  16: "Document is blur",
  17: "Not Uploaded",
  18: "Incorrect Name",
  19: "Incorrect DOB",
  20: "Incorrect IFSC Code",
  21: "Incomplete Marksheet",
  22: "Without Aadhar Number",
};

export const DocStatus = {
  AUTOMATED: "AUTOMATED",
  REJECTED: "REJECTED",
};

export const DocType = {
  AADHAAR_FRONT: "AADHAAR_FRONT",
  AADHAAR_BACK: "AADHAAR_BACK",
  PAN: "PAN",
  EDUCATION_CERTIFICATE: "EDUCATION_CERTIFICATE",
  USER_PHOTO: "USER_PHOTO",
  PAN_NOC: "PAN_NOC",
};

export const AddType = {
  HOME: "HOME",
  WORK: "WORK",
};

export const AddDetailsKeys = {
  BENE_NAME_VERIFIED: "isBeneNameVerified",
  AADHAAR_NAME: "aadhaarName",
  RE_REGISTER: "isReRegister",
  NOC_REQUIRED: "isNocRequired",
  WHATSAPP_CONSENT: "isWhatsappConsent",
  EXPERIENCED: "isExperienced",
  POLITICALLY_EXPOSED: "isPoliticallyExposed",
};

export const statusMappings = {
  CREATED: {
    currentOnboardingStatus: "incomplete_leads",
    currentOnboardingBtn: "Complete KYC",
    currentOnboardingMsg: "Complete KYC",
    kycStatusMsg: "KYC in process",
    redirectionLink: "/profile?",
  },
  REGISTRATION_REQUESTED: {
    currentOnboardingStatus: "in_review",
    currentOnboardingMsg:
      "Your documents are being reviewed by our team. Verification usually takes 24 hours.",
    kycStatusMsg: "KYC in review",
  },
  VERIFIED: {
    currentOnboardingStatus: "TRAINING_MATERIAL_SHARED",
    currentOnboardingMsg: "Check your study material and start training",
    kycStatusMsg: "KYC successfully done.",
  },
  DOCUMENTS_REUPLOAD_REQUIRED: {
    currentOnboardingStatus: "doc_invalid",
    kycStatusMsg: "KYC was not successful",
    currentOnboardingMsg:
      "Your KYC verification failed. Please reupload invalid documents",
    currentOnboardingBtn: "Reupload documents",
    redirectionLink: "/profile?",
  },
  REJECTED: {
    currentOnboardingStatus: "rejected",
    kycStatusMsg: "KYC rejected",
    currentOnboardingMsg:
      "Your KYC is rejected. Please contact our support team.",
  },
  CLOSED: {
    currentOnboardingStatus: "closed",
    kycStatusMsg: "KYC in Review",
    currentOnboardingMsg:
      "Error occured while creating your account. Please contact our support team.",
  },
  REGISTERED: {
    currentOnboardingStatus: "registered",
    kycStatusMsg: "KYC successfully done.",
    currentOnboardingMsg:
      "Congratulations! You are now a registered POS and can start selling policies.",
  },
};

export const rejectionStatusMapping = {
  [rejectionRemarks.PAN_REGISTERED_WITH_IRDA]: {
    currentOnboardingBtn: "Change PAN",
    redirectionLink: "/self-onboarding?",
    currentOnboardingMsg: "Pan Already Registered With IRDAI",
  },
  [rejectionRemarks.BENEFICIARY_NAME_CONFLICT]: {
    currentOnboardingBtn: "Update Bank Details",
    redirectionLink: "/self-onboarding?step=4&profile=1",
    currentOnboardingMsg: "Beneficiary Name Mismatch",
  },
};

export const trainingStatusMapping = {
  TRAINING_MATERIAL_SHARED: {
    currentOnboardingStatus: "TRAINING_MATERIAL_SHARED",
    currentOnboardingMsg: "Check your study material and start training",
  },
  TRAINING_MATERIAL_DOWNLOADED: {
    currentOnboardingStatus: "TRAINING_MATERIAL_DOWNLOADED",
    currentOnboardingMsg:
      "Study material downloaded, please check it and resume training",
  },
  TEST_LINK_SHARED: {
    currentOnboardingStatus: "TEST_LINK_SHARED",
    currentOnboardingMsg: "Your test window is now open",
  },
  TEST_FAILED: {
    currentOnboardingStatus: "TEST_FAILED",
    currentOnboardingMsg: "Oops! You will have to retake the test.",
  },
  COMPLETED: {
    currentOnboardingStatus: "COMPLETED",
    currentOnboardingMsg:
      "Congratulations! You have passed the test. Please wait until we register you as a POS agent.",
  },
};
export const trainingEventPropertyMapping = {
  TRAINING_MATERIAL_SHARED: "trainingMaterialSharedTime",
  TRAINING_MATERIAL_DOWNLOADED: "trainingMaterialDownloadedTime",
  TEST_LINK_SHARED: "testLinkSharedTime",
  TEST_FAILED: "testCompletedTime",
  COMPLETED: "testCompletedTime",
};
export const TrainingStatus = {
  TRAINING_MATERIAL_SHARED: "TRAINING_MATERIAL_SHARED",
  TRAINING_MATERIAL_DOWNLOADED: "TRAINING_MATERIAL_DOWNLOADED",
  TEST_LINK_SHARED: "TEST_LINK_SHARED",
  TEST_FAILED: "TEST_FAILED",
  COMPLETED: "COMPLETED",
};

export const StudyMaterialLink = {
  GENERAL:
    "https://posstatic.insurancedekho.com/docs/general-study-material.pdf",
  LIFE: "https://posstatic.insurancedekho.com/docs/life-study-material.pdf",
};
