let BannerPanelModule = document.createElement("div");
BannerPanelModule.setAttribute("id", "BannerPanelModuleContainer");
document.querySelector('body').appendChild(BannerPanelModule)

var BannerPanelModuleWidget = new CommonWidget(
  "BannerPanelModuleContainer",
  "BannerPanelModule"
);
BannerPanelModuleWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
BannerPanelModuleWidget.init({});
