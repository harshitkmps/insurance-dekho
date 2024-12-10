let VideoPanelModule = document.createElement("div");
VideoPanelModule.setAttribute("id", "VideoPanelModuleContainer");
document.querySelector('body').appendChild(VideoPanelModule)

var VideoPanelModuleWidget = new CommonWidget(
  "VideoPanelModuleContainer",
  "VideoPanelModule"
);
VideoPanelModuleWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
VideoPanelModuleWidget.init({});
