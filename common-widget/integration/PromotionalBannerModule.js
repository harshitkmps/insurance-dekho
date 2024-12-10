let PromotionalBannerModule = document.createElement("div");
PromotionalBannerModule.setAttribute("id", "PromotionalBannerModuleContainer");
document.querySelector('body').appendChild(PromotionalBannerModule)

var PromotionalBannerModuleWidget = new CommonWidget(
  "PromotionalBannerModuleContainer",
  "PromotionalBannerModule"
);
PromotionalBannerModuleWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
PromotionalBannerModuleWidget.init({});
