import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
import { BrowserRouter } from "react-router-dom";
const BannerPanel = React.lazy(() => import("../components/PromotionalBannerModule/BannerPanelModule/BannerPanel"));

export default function BannerPanelModule({context}) {
  let useSelector = createSelectorHook(context)
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return <BrowserRouter><BannerPanel context={context} userRole={moduleOptions.role} moduleOptions={moduleOptions}></BannerPanel></BrowserRouter>;
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
