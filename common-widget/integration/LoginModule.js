let LoginModuleContainer = document.createElement("div");
LoginModuleContainer.setAttribute("id", "LoginModuleContainer");
document.querySelector('body').appendChild(LoginModuleContainer)

var logoutWidget = new CommonWidget(
  "LoginModuleContainer",
  "LoginModule"
);
logoutWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
logoutWidget.setLoginOptions(['otp']);
logoutWidget.init({});
