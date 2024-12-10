window.commonWidgetServer = "";
function CommonWidget(elementId, moduleName) {
  this.eventListener = function () {};
  this.setEventListener = function (eventListener) {
    this.eventListener = eventListener;
  };
  this.loginOptions = [];
  this.setLoginOptions = function (loginOptions) {
    this.loginOptions = loginOptions;
  };
  this.layout = "basic";
  this.setLayout = function (layout) {
    this.layout = layout;
  };
  this.init = function (option) {
    const options = {
      ...option,
      eventListener: this.eventListener,
      loginOptions: this.loginOptions,
      layout: this.layout,
      source: "",
      sub_source: "",
      signup: true,
    };
    let addScript = function (scriptPath, callback) {
      const script = document.createElement("script");
      script.setAttribute("id", "script-id");
      const position = document.querySelector("head");
      position.appendChild(script);
      script.onload = callback;
      script.src = scriptPath;
    };
    addScript(window.commonWidgetServer + "integration/index.js", function () {
      window["LoadCommonWidget"](moduleName, elementId, options);
    });
  };
}
