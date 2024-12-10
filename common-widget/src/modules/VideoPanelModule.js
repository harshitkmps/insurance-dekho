import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
const VideoPanel = React.lazy(() => import("../components/LearningModule/VideoPanelModule/VideoPanel"));

export default function VideoPanelModule({context}) {
  let useSelector = createSelectorHook(context);
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return <VideoPanel context={context} userRole={moduleOptions.role} showMasterClassBanner={moduleOptions.showMasterClassBanner} uuid={moduleOptions.uuid} product={moduleOptions.product} role={moduleOptions.role}></VideoPanel>;
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
