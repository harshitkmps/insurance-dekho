export const kycOptions = {
  PAN_CARD: {
    value: "Pan Card",
    slug: "pan_card",
    dropdown: false,
    kycMode: "ckyc",
  },
  AADHAR_CARD: {
    value: "Aadhar Card",
    slug: "aadhar_card",
    dropdown: false,
    kycMode: "ckyc",
  },
  AADHAR_CARD_OVD: {
    value: "Upload Aadhar",
    slug: "aadhar_card_ovd",
    dropdown: false,
    isExtractedFromOvd: true,
    kycMode: "ovd",
  },
  UPLOAD_DOCUMENT: {
    value: "Upload Document",
    slug: "upload_document",
    dropdown: false,
    kycMode: "ovd",
  },
  OTHER_DOCUMENTS: {
    value: "Other Documents",
    slug: "other_documents",
    dropdown: true,
    kycMode: "ckyc",
  },
};

export const defaultSortingOrder = [
  kycOptions.PAN_CARD,
  kycOptions.AADHAR_CARD,
  kycOptions.AADHAR_CARD_OVD,
  kycOptions.UPLOAD_DOCUMENT,
  kycOptions.OTHER_DOCUMENTS,
];

const swapPositions = (arr, one, two) => {
  const element = arr[one];
  arr[one] = arr[two];
  arr[two] = element;
};

const swapElementsByKeys = (array, key1, key2) => {
  const index1 = array.findIndex((item) => item.slug === key1);
  const index2 = array.findIndex((item) => item.slug === key2);

  if (index1 !== -1 && index2 !== -1) {
    swapPositions(array, index1, index2);
  }
};

const moveArrayObjectToFirstPosition = (array, object) => {
  const index = array.indexOf(object);
  if (index !== -1) {
    array.splice(index, 1);
    array.unshift(object);
  }
};

const maximumSuccessPercentage = (successRates: Object): number => {
  return Math.max(...Object.values(successRates));
};

export function modifyInsurerKycSortingOrder(kycStatsBasedOnConfig) {
  const successRates = kycStatsBasedOnConfig?.successRates;
  const ckycSuccessRates = successRates?.ckyc;
  const ovdSuccessRates = successRates?.ovd;

  const maximumSuccessPercentageInCkyc =
    ckycSuccessRates && maximumSuccessPercentage(ckycSuccessRates);
  const maximumSuccessPercentageInOvd =
    ovdSuccessRates && maximumSuccessPercentage(ovdSuccessRates);

  const sortingOrder = [...defaultSortingOrder];
  if (maximumSuccessPercentageInOvd > maximumSuccessPercentageInCkyc) {
    moveArrayObjectToFirstPosition(sortingOrder, kycOptions.UPLOAD_DOCUMENT);
    moveArrayObjectToFirstPosition(sortingOrder, kycOptions.AADHAR_CARD_OVD);
  }
  const panCardSuccessRate = ckycSuccessRates?.pan_card;
  const aadharCardSuccessRate = ckycSuccessRates?.aadhar_card;
  if (aadharCardSuccessRate > panCardSuccessRate) {
    swapElementsByKeys(sortingOrder, "pan_card", "aadhar_card");
  }
  const maxSuccessPercentage = Math.max(
    maximumSuccessPercentageInCkyc ?? 0,
    maximumSuccessPercentageInOvd ?? 0
  );
  const successMetrics = {
    percentage: maxSuccessPercentage,
    showMessage: maxSuccessPercentage > 70,
    option:
      maximumSuccessPercentageInOvd > maximumSuccessPercentageInCkyc
        ? "Upload Document"
        : (panCardSuccessRate ?? 0) > (aadharCardSuccessRate ?? 0)
        ? "Pan Card"
        : "Aadhar Card",
  };

  return { modifiedInsurerKycSortingOrderConfig: sortingOrder, successMetrics };
}

const filterCkycDocuments = ["pan_card", "aadhar_card"];
const filterDocumentsFromList = (list) => {
  return list.filter(
    (item) => !filterCkycDocuments.includes(item.document_slug)
  );
};

const possibleOvdDocumentsToExtract = ["aadhar_card"];
const extractDocumentsFromOvd = (
  ckycDataFromMasterConfig,
  ovdDocumentsConfig
) => {
  const possibleDocumentsToExtract = possibleOvdDocumentsToExtract;
  // if not in ckyc config, pull out from ovd
  return possibleDocumentsToExtract
    .map((option) => {
      // check if ckyc
      let hasOptionInOvdOnly = false;
      let hasOptionInCkycOrOkyc = false;
      if (ckycDataFromMasterConfig) {
        for (const ckycOption of ckycDataFromMasterConfig) {
          if (
            possibleDocumentsToExtract.includes(ckycOption?.["document_slug"])
          ) {
            hasOptionInCkycOrOkyc = true;
            break;
          }
        }
      }
      let hasOptionInOvd = false;
      if (ovdDocumentsConfig) {
        for (const ovdOption of ovdDocumentsConfig) {
          if (
            possibleDocumentsToExtract.includes(ovdOption?.["document_slug"])
          ) {
            hasOptionInOvd = true;
            break;
          }
        }
      }
      if (hasOptionInOvd && !hasOptionInCkycOrOkyc) {
        hasOptionInOvdOnly = true;
      }
      if (hasOptionInOvdOnly) {
        return option;
      }
      return null;
    })
    .filter((option) => option !== null);
};

export const mapKycHeadersWithData = (kycConfig: any = {}) => {
  const kycDocumentsConfig = kycConfig?.insurer_document_config;
  const kycStatusConfig = kycConfig?.status_config;

  let ckycDataFromMasterConfig = [];

  if (
    kycStatusConfig?.is_ckyc_enabled &&
    Array.isArray(kycDocumentsConfig?.ckyc)
  ) {
    ckycDataFromMasterConfig.push(...kycDocumentsConfig.ckyc);
  }

  if (
    kycStatusConfig?.is_okyc_enabled &&
    Array.isArray(kycDocumentsConfig?.okyc)
  ) {
    ckycDataFromMasterConfig.push(...kycDocumentsConfig.okyc);
  }
  const panCardConfig = ckycDataFromMasterConfig.find(
    (obj) => obj.document_slug === "pan_card"
  );
  const aadharCardConfig = ckycDataFromMasterConfig.find(
    (obj) => obj.document_slug === "aadhar_card"
  );
  let ovdDocumentsConfig =
    kycStatusConfig?.is_ovd_enabled && kycDocumentsConfig.ovd;

  const extractedDocumentsFromOvd = extractDocumentsFromOvd(
    ckycDataFromMasterConfig,
    ovdDocumentsConfig
  );

  ckycDataFromMasterConfig = filterDocumentsFromList(ckycDataFromMasterConfig);

  const otherDocumentsConfig = ckycDataFromMasterConfig;

  const config = {};

  if (panCardConfig) {
    config["pan_card"] = panCardConfig;
  }
  if (aadharCardConfig) {
    config["aadhar_card"] = aadharCardConfig;
  }
  if (otherDocumentsConfig?.length > 0) {
    config["other_documents"] = otherDocumentsConfig;
  }

  extractedDocumentsFromOvd.forEach((option) => {
    config[`${option}_ovd`] = ovdDocumentsConfig?.find(
      (opt) => opt.document_slug === option
    );
    ovdDocumentsConfig = ovdDocumentsConfig?.filter(
      (opt) => opt.document_slug !== option
    );
  });

  if (ovdDocumentsConfig) {
    config["upload_document"] = ovdDocumentsConfig;
  }
  return config;
};
