import App from "./App";

import ReactDom from "react-dom";
import { Provider } from "react-redux";
import { createContext } from "react";
import getStore from "./redux/store";

window.WidgetSingleton = (function () {
  var instance;

  function createInstance() {
    var object = new Object(
      "WidgetSingleton created at: " + new Date().toLocaleString()
    );
    return object;
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

window.initCommonWidget = function (
  moduleName,
  containerId = "app-root",
  moduleOptions = {}
) {
  let cs = window.WidgetSingleton.getInstance();
  let element = false;
  if(cs[containerId]){
    element = cs[containerId]
  }else{
    const moduleContext = createContext();
    element = (<Provider store={getStore(moduleContext)} context={moduleContext}>
        <App
          moduleName={moduleName}
          moduleOptions={moduleOptions}
          context={moduleContext}
        ></App>
      </Provider>)
      cs[containerId] = element
  }
  ReactDom.render(
    element,
    document.getElementById(containerId)
  );
};
