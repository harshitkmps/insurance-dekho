function LoadCommonWidget(moduleName, elementId, options) {
  function addScript(scriptPath, callback) {
    const script = document.createElement("script");
    script.setAttribute("id", "script-id");
    const position = document.querySelector("body");
    position.appendChild(script);
    script.onload = callback;
    script.src = scriptPath;
  }
  function addStyle(stylePath) {
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.href = stylePath;
    const position = document.querySelector("head");
    position.appendChild(style);
  }
  if (window["initCommonWidget"]) {
    window["initCommonWidget"](moduleName, elementId, options);
  } else {
    fetch(commonWidgetServer + "asset-manifest.json?q="+(new Date()).getTime())
      .then(function (response) {
        if (response.status !== 200) {
          console.log("Error Status Code: " + response.status);
          return;
        }
        function initCallback() {
          if (window["initCommonWidget"]) {
            window["initCommonWidget"](moduleName, elementId, options);
          }
        }
        response.json().then(function (data) {
          data.entrypoints.forEach((scr) => {
            if (scr.endsWith(".js")) {
              addScript(commonWidgetServer + scr, initCallback);
            } else if (scr.endsWith(".css")) {
              addStyle(commonWidgetServer + scr);
            }
          });
        });
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  }
}
