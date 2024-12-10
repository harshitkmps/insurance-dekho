import axios from "axios";

let alpacaFilesJS = [
  "https://code.jquery.com/jquery-1.11.1.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js",
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js",
  "https://cdn.jsdelivr.net/npm/alpaca@1.5.27/dist/alpaca/bootstrap/alpaca.min.js",
];

let alpacaFilesCSS = [
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/alpaca@1.5.27/dist/alpaca/bootstrap/alpaca.min.css",
];

let loadAlpaca = (elementId, jsonSchema) => {
  if ("undefined" != typeof jQuery && window.hasOwnProperty("$")) {
    window.$("#" + elementId).alpaca(jsonSchema);
    registerExternalFormElements(elementId);
    return true;
  }
  return false;
};

let loadAlpacaRetry = (elementId, jsonSchema) => {
  setTimeout(() => {
    if (!loadAlpaca(elementId, jsonSchema)) {
      loadAlpacaRetry(elementId, jsonSchema);
    }
  }, 100);
};

let alpacaForms = (tag, schema) => {
  function addScript(scriptPath, callback) {
    const script = document.createElement("script");
    const position = document.querySelector("head");
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

  addScript(alpacaFilesJS[0], () => {
    addScript(alpacaFilesJS[1], () => {
      addScript(alpacaFilesJS[2], () => {
        addScript(alpacaFilesJS[3], () => {
          loadAlpacaRetry(tag, schema);
        });
      });
    });
  });

  alpacaFilesCSS.forEach((scr) => {
    addStyle(scr);
  });
};

export default alpacaForms;

function registerExternalFormElements(formId) {
  window.$.alpaca.Fields.PincodeField = window.$.alpaca.Fields.TextField.extend(
    {
      getFieldType: function () {
        return "pincode";
      },
      getValue: function () {
        var value = this.control[0].getAttribute("key");
        return value;
      },
      onKeyUp: async function (e) {
        if (e.target.value > 99999 && e.target.value <= 999999) {
          let res = await axios.get(
            "https://masterdata.insurancedekho.com/api/v1/master/pincode?&limit=1&pincode=" +
              e.target.value
          );
          res = res.data;
          if (
            res.data != undefined &&
            res.data != "" &&
            res.data[0] != undefined
          ) {
            let pincodeObj = res.data[0];
            let v = pincodeObj.cityName + `(${pincodeObj.pincode})`;
            e.target.setAttribute("key", e.target.value);
            e.target.value = v;
          }
        }
      },
    }
  );
  window.$.alpaca.registerFieldClass(
    "pincode",
    window.$.alpaca.Fields.PincodeField
  );
}
