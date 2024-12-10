import moment from "moment";
export default class LifeUtils {
  static calculateAge = (dob) => {
    const birthDate = moment(dob, "DD-MM-YYYY");
    if (!birthDate.isValid()) {
      return;
    }
    const today = moment();
    let age = today.year() - birthDate.year();
    if (
      today.month() < birthDate.month() ||
      (today.month() === birthDate.month() && today.date() < birthDate.date())
    ) {
      age--;
    }

    return age;
  };

  static createMultipleEntries(doc: any, months: number) {
    //this function is used to create multiple entries for the required documents
    const entries = [];
    for (let i = 1; i <= months; i++) {
      entries.push({
        ...doc,
        docNameSlug: `proposer_${this.adjustDocumentDetails(
          doc.docNameSlug,
          true
        )}_${i}`,
        docName: `Proposer ${this.adjustDocumentDetails(
          doc.docName,
          true
        )} (Document ${i})`,
        isMandatory: i === 1 ? true : false,
      });
    }
    return entries;
  }

  static adjustDocumentDetails = (nameOrSlug, isProposer = true) => {
    return isProposer ? nameOrSlug : nameOrSlug.replace(/^Proposer[_\s]+/, "");
  };

  static restructureDocuments(body: any, data: any) {
    //this function is use to restructe the response getting from brokerage to render the components dynamically on frontend.

    const insuredPerson = body.insuredPerson.toLowerCase();
    const insuredPersonOccupation = body.insuredPersonOccupation.toLowerCase();
    const insuredPersonAge = this.calculateAge(body.insuredPersonDob);
    let showIncomeProof = true;
    if (insuredPerson === "spouse" && insuredPersonOccupation === "housewife") {
      showIncomeProof = false;
    }
    if (
      insuredPerson === "child" &&
      (insuredPersonOccupation === "student" || insuredPersonAge < 18)
    ) {
      showIncomeProof = false;
    }
    return data.map((doc) => {
      const newDoc = {
        insurerId: doc?.insurerId,
        subProductTypeId: doc?.subProductTypeId,
        isPanCard: doc?.isPanCard,
        isPhotograph: doc?.isPhotograph,
        isCancelledCheque: doc?.isCancelledCheque,
        isEcsSiOpted: doc?.isEcsSiOpted,
        minAge: doc?.minAge,
        maxAge: doc?.maxAge,
        minSumAssured: doc?.minSumAssured,
        maxSumAssured: doc?.maxSumAssured,
        occupationId: doc?.occupationId,
        occupation: doc?.occupation,
        occupationCode: doc?.occupationCode,
        KYC: [],
        IncomeProof: [],
        OtherDocuments: [],
        Documents: [],
      };

      Object.keys(doc).forEach((key) => {
        if (key.includes("kycDocumentProofIds")) {
          const kycDocuments = doc[key].map((item) => ({
            ...item,
            docNameSlug: `proposer_${this.adjustDocumentDetails(
              item.docNameSlug,
              true
            )}`,
            docName: `Proposer ${this.adjustDocumentDetails(
              item.docName,
              true
            )}`,
            isMandatory: true,
          }));
          newDoc.KYC.push(...kycDocuments);

          if (insuredPerson !== "self") {
            const insuredKycDocuments = kycDocuments.map((item) => ({
              ...item,
              docNameSlug: `${insuredPerson}_${this.adjustDocumentDetails(
                item.docNameSlug,
                false
              )}`,
              docName: `${body.insuredPerson} ${this.adjustDocumentDetails(
                item.docName,
                false
              )}`,
            }));
            newDoc.KYC.push(...insuredKycDocuments);
          }
        } else if (key.includes("incomeProofIds")) {
          const incomeProofDocs = [];
          doc[key].forEach((incomeProof) => {
            if (incomeProof.docNameSlug.includes("latest_3_month")) {
              incomeProofDocs.push(
                ...this.createMultipleEntries(incomeProof, 3)
              );
            } else if (incomeProof.docNameSlug.includes("latest_6_month")) {
              incomeProofDocs.push(
                ...this.createMultipleEntries(incomeProof, 6)
              );
            } else {
              incomeProofDocs.push({
                ...incomeProof,
                docNameSlug: `proposer_${this.adjustDocumentDetails(
                  incomeProof.docNameSlug,
                  true
                )}`,
                docName: `Proposer ${this.adjustDocumentDetails(
                  incomeProof.docName,
                  true
                )}`,
                isMandatory: true,
              });
            }
          });

          newDoc.IncomeProof.push(...incomeProofDocs);

          if (insuredPerson !== "self" && showIncomeProof) {
            const insuredIncomeProofDocs = incomeProofDocs.map((item) => ({
              ...item,
              docNameSlug: `${insuredPerson}_${this.adjustDocumentDetails(
                item.docNameSlug,
                false
              )}`,
              docName: `${body.insuredPerson} ${this.adjustDocumentDetails(
                item.docName,
                false
              )}`,
            }));
            newDoc.IncomeProof.push(...insuredIncomeProofDocs);
          }
        } else if (key.includes("otherProofIds")) {
          newDoc.OtherDocuments.push(
            {
              ...doc[key]?.[0],
              docNameSlug: "other_document_1",
              isMandatory: false,
            },
            {
              ...doc[key]?.[0],
              docNameSlug: "other_document_2",
              isMandatory: false,
            },
            {
              ...doc[key]?.[0],
              docNameSlug: "other_document_3",
              isMandatory: false,
            }
          );
        } else if (
          !key.includes("paymentModeProofIds") &&
          !key.includes("liveProofIds") &&
          key.endsWith("ProofIds")
        ) {
          newDoc.Documents.push(
            ...doc[key].map((item) => ({
              ...item,
              isMandatory:
                (item.docTypeSlug === "benefit_illustration" &&
                  body?.productType === "investment") ||
                item.docTypeSlug === "policy_document"
                  ? false
                  : true,
            }))
          );
        }
      });

      return newDoc;
    });
  }
}
