import { MOTOR_OFFLINE_STATUS } from "../../constants/itms.constants";

export const buildProposalSummary = async (
  itmsStatusId: number,
  params: any
) => {
  const proposalSummaryDetails = {};
  let message = params?.statusName ?? "";
  if (
    MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED === itmsStatusId ||
    MOTOR_OFFLINE_STATUS.INSPECTION_RECOMMENDED === itmsStatusId
  ) {
    message = KYC_IN_PROCESS;
    if (params?.paymentMode === 2) {
      message = POLICY_IN_PROCESS;
    }
  }
  if (MOTOR_OFFLINE_STATUS.PAYMENT_LINK_SHARED === itmsStatusId) {
    if (params?.kycStatus === "success") {
      if (params?.isPaymentLinkExpired === 1) {
        message = PAYMENT_LINK_EXPIRED.replace(
          "%s",
          params?.supporting_message ?? ""
        );
      } else {
        message = PAYMENT_LINK_SHARE.replace(
          "%s",
          params?.supporting_message ?? ""
        );
      }
    }
  }
  if (
    MOTOR_OFFLINE_STATUS.POLICY_ISSUED === itmsStatusId ||
    MOTOR_OFFLINE_STATUS.CASE_PICKED === itmsStatusId
  ) {
    message = POLICY_ISSUED;
  }
  if (MOTOR_OFFLINE_STATUS.PAYMENT_DONE === itmsStatusId) {
    message = PAYMENT_COMPLETED;
  }
  if (MOTOR_OFFLINE_STATUS.CLOSED === itmsStatusId) {
    message = TICKET_CLOSED.replace("%s", params?.supporting_message ?? "");
  }
  if (MOTOR_OFFLINE_STATUS.INSPECTION_EXPIRED === itmsStatusId) {
    message = INSPECTION_EXPIRED;
  }
  if (MOTOR_OFFLINE_STATUS.DOC_PENDING === itmsStatusId) {
    if (params?.kycStatus === "failed") {
      message = KYC_REJECTED;
    } else {
      message = DOCUMENT_PENDING;
    }
  }
  if (MOTOR_OFFLINE_STATUS.INSPECTION_APPROVAL_PENDING === itmsStatusId) {
    message = INSPECTION_APPROVAL_PENDING;
  }
  proposalSummaryDetails["message"] = message;
  return proposalSummaryDetails;
};

const KYC_IN_PROCESS = "Please wait your KYC is being processed.";
const POLICY_IN_PROCESS = "We are in process to get your policy issued.";
const PAYMENT_LINK_SHARE =
  "Your KYC is successful. Please verify details and make payment before %s";
const PAYMENT_LINK_EXPIRED = "Your KYC is successful. %s";
const PAYMENT_COMPLETED =
  "We'll verify payment and provide policy copy shortly.";
const POLICY_ISSUED = "Your vehicle is secure !";
const TICKET_CLOSED = "Closed! %s";
const INSPECTION_EXPIRED =
  "Inspection Expired ! Please contact our sales representative.";
const INSPECTION_APPROVAL_PENDING =
  "We have shared proposal for insurer approval. We will share payment link shortly";
const KYC_REJECTED = "Your KYC is rejected. Please proceed again.";
const DOCUMENT_PENDING =
  "Documents Pending ! Please upload required documents.";
