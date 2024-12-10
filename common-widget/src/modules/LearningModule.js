import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
const Learning = React.lazy(() => import("../components/LearningModule/Learning"));

export default function LearningModule({context}) {
  let useSelector = createSelectorHook(context)
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return <Learning 
          context={context} 
          showMasterClassBanner={moduleOptions.showMasterClassBanner} 
          uuid={moduleOptions.uuid} 
          product={moduleOptions.product} 
          role={moduleOptions.role} 
          mostWatchedVideos={moduleOptions.mostWatchedVideos} 
        ></Learning>;
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
