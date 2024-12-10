import React, { useEffect } from "react";
import { validateGoogleLogin } from "../../../redux/actions";
import { createSelectorHook, createDispatchHook } from "react-redux";
import configs from "../../../app-configs";

export default function GoogleLoginButton({context}) {
  let useSelector = createSelectorHook(context)
  let useDispatch = createDispatchHook(context)
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    document.body.appendChild(script);
    script.src = "https://accounts.google.com/gsi/client";
  }, []);
  const appEvent = useSelector((state) => state.GoogleLoginReducer.appEvent);
  const appEventData = useSelector(
    (state) => state.GoogleLoginReducer.appEventData
  );
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );

  const dispatch = useDispatch();

  window.gsiCallback = function (res) {
    dispatch(validateGoogleLogin(res));
  };

  useEffect(
    function () {
      moduleOptions.eventListener(appEvent, appEventData);
    },
    [appEvent]
  );

  const client_id = configs.googleClientId;

  return (
    <div>
      <div
        id="g_id_onload"
        data-client_id={client_id}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="gsiCallback"
        data-auto_prompt="false"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="center"
        data-width="310"
      ></div>
    </div>
  );
}
