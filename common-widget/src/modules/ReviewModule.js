import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
const Review = React.lazy(() => import("../components/ReviewModule/index.js"));

export default function ReviewModule({ context }) {
  let useSelector = createSelectorHook(context);
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return <Review context={context}></Review>;
    }
  }
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{renderLayout()}</Suspense>
    </div>
  );
}
