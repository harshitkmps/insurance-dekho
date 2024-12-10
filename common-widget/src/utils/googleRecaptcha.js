import configs from "../app-configs";
export default function loadGoogleRecaptcha(callback) {
  return new Promise(function (resolve) {
    var d = document;
    var s = d.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src =
      "https://www.google.com/recaptcha/api.js?render=" +
      configs.googleRecaptchaSiteKey;
    var x = d.getElementsByTagName("script")[0];
    x.parentNode.insertBefore(s, x);
    if (s.readyState) {
      // only required for IE <9
      s.onreadystatechange = function () {
        if (s.readyState === "loaded" || s.readyState === "complete") {
          s.onreadystatechange = null;
          callback(resolve);
        }
      };
    } else {
      //Others
      s.onload = function () {
        callback(resolve);
      };
    }
  });
}
