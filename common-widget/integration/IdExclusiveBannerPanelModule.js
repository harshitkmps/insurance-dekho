const IdExclusiveBannerModuleContainer = document.createElement("div");
IdExclusiveBannerModuleContainer.setAttribute(
  "id",
  "IdExclusiveBannerPanelModuleContainer"
);
document.querySelector("body").appendChild(IdExclusiveBannerModuleContainer);

const IdExclusiveBannerWidget = new CommonWidget(
  "IdExclusiveBannerPanelModuleContainer",
  "IdExclusiveBannerModule"
);
IdExclusiveBannerWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
// KycWidget.setKycOptions(['otp']);
IdExclusiveBannerWidget.init({});
