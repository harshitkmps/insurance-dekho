import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
const Logout = React.lazy(() => import("../components/Logout"));

export default function LoginModule({context}) {
  let useSelector = createSelectorHook(context)
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return <Logout context={context}></Logout>;
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
