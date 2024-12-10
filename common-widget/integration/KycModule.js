let KycModuleContainer = document.createElement("div");
KycModuleContainer.setAttribute("id", "KycModuleContainer");
document.querySelector('body').appendChild(KycModuleContainer)

var KycWidget = new CommonWidget(
  "KycModuleContainer",
  "KycModule"
);
KycWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
// KycWidget.setKycOptions(['otp']);
KycWidget.init({});
