import React from "react";
import "./LoginLayoutBasic.scss";
import { createSelectorHook } from "react-redux";
const OTPLogin = React.lazy(() => import("../components/LoginModule/OTPLogin"));
const GoogleLogin = React.lazy(() =>
  import("../components/LoginModule/GoogleLogin")
);

function OrLine() {
  return (
    <div className="line-or">
      <div className="line"></div>
      Or
      <div className="line"></div>
    </div>
  );
}

export default function LoginLayoutBasic({context, initialCTA }) {
  let useSelector = createSelectorHook(context)
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );

  function renderOtpLogin() {
    if (moduleOptions.loginOptions.indexOf("otp") !== -1) {
      return (
        <div className="otpLogin">
          <OTPLogin context={context} initialCTA={initialCTA} ></OTPLogin>
        </div>
      );
    }
  }
  function renderGoogleLogin() {
    if (moduleOptions.loginOptions.indexOf("google") !== -1) {
      return (
        <div className="googleLogin">
          <GoogleLogin context={context}></GoogleLogin>
        </div>
      );
    }
  }

  function showOrLine() {
    if (
      moduleOptions.loginOptions.indexOf("google") !== -1 &&
      moduleOptions.loginOptions.indexOf("otp") !== -1
    ) {
      return <OrLine></OrLine>;
    }
  }

  return (
    <React.Fragment>
      {renderOtpLogin()}
      {showOrLine()}
      {renderGoogleLogin()}
    </React.Fragment>
  );
}
