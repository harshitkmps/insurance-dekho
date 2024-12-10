let FingerPrintModuleContainer = document.createElement("div");
FingerPrintModuleContainer.setAttribute("id", "FingerPrintModuleContainer");
document.querySelector("body").appendChild(FingerPrintModuleContainer);

var FingerPrint = new CommonWidget(
  "FingerPrintModuleContainer",
  "FingerPrintModule"
);

FingerPrint.init();