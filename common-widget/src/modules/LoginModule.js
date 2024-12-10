import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
import "./LoginModule.scss";
const LoginLayoutBasic = React.lazy(() =>
  import("../layouts/LoginLayoutBasic")
);

export default function LoginModule({context}) {
  let useSelector = createSelectorHook(context)
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return (
          <div>
            <LoginLayoutBasic context={context} initialCTA ={moduleOptions?.initialCTA}></LoginLayoutBasic>
          </div>
        );
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
