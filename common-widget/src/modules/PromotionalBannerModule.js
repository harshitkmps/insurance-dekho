import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
import { BrowserRouter } from "react-router-dom";
const PromotionalBanner = React.lazy(() =>
  import("../components/PromotionalBannerModule/PromotionalBanner")
);

export default function PromotionalBannerModule({ context }) {
  let useSelector = createSelectorHook(context);
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return (
          <BrowserRouter>
            <PromotionalBanner
              context={context}
              moduleOptions={moduleOptions}
            ></PromotionalBanner>
          </BrowserRouter>
        );
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
