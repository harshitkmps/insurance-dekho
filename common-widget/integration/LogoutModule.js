let LogoutModule = document.createElement("div");
LogoutModule.setAttribute("id", "LogoutModuleContainer");
document.querySelector('body').appendChild(LogoutModule)

var logoutWidget = new CommonWidget(
  "LogoutModuleContainer",
  "LogoutModule"
);
logoutWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
logoutWidget.init({});
