import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
const FingerPrint = React.lazy(() => import("../components/FingerPrint"));

export default function FingerPrintModule({context}) {
  let useSelector = createSelectorHook(context)
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return <FingerPrint></FingerPrint>;
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
