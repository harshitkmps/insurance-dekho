export default class LeadUtils {
  static getLeadExamStatusLabel(status: any): string {
    if (status === "COMPLETED" || status === "exam_cleared") {
      return "Test Cleared";
    }
    if (status === "TEST_LINK_SHARED" || status === "exam_pending") {
      return "Test Link Shared";
    }
    if (status === "TEST_FAILED" || status === "exam_failed") {
      return "Test Failed";
    }
    if (
      status === "TRAINING_MATERIAL_DOWNLOADED" ||
      status === "training_in_progress"
    ) {
      return "Training In Progress";
    }
    if (
      status === "TRAINING_MATERIAL_SHARED" ||
      status === "training_not_initiated"
    ) {
      return "Study Material Shared";
    }
    return "Study Link Pending";
  }
  static getLeadStatusLabel(status) {
    if (status === "CREATED" || status === "pending") {
      return "Pending";
    }
    if (status === "REGISTERED" || status === "registered") {
      return "Registered";
    }
    if (
      status === "REGISTRATION_REQUESTED" ||
      status === "VERIFIED" ||
      status === "reg_requested"
    ) {
      return "Reg. requested";
    }
    if (status === "DOCUMENTS_REUPLOAD_REQUIRED" || status === "doc_invalid") {
      return "Doc invalid";
    }
    if (status === "REJECTED" || status === "rejected") {
      return "Rejected";
    }
    if (status === "CLOSED" || status === "close") {
      return "closed";
    }
  }

  static getLeadOrigin(leadOrigin) {
    if (leadOrigin === "self") {
      return "Self";
    } else if (leadOrigin === "rm_flow") {
      return "RM Flow";
    }
  }
}
