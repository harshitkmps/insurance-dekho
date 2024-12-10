import React, { useEffect } from "react";
import { logout } from "../../redux/actions";
import { createSelectorHook, createDispatchHook } from "react-redux";

export default function LogoutButton({context}) {
  let useSelector = createSelectorHook(context)
  let useDispatch = createDispatchHook(context)
  const appEvent = useSelector((state) => state.LogoutReducer.appEvent);
  const appEventData = useSelector((state) => state.LogoutReducer.appEventData);
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );

  const dispatch = useDispatch();

  function initLogout() {
    dispatch(logout());
  }

  useEffect(
    function () {
      moduleOptions.eventListener(appEvent, appEventData);
    },
    [appEvent]
  );

  return (
    <div>
      <button onClick={initLogout}>Logout</button>
    </div>
  );
}
