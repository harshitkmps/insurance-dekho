import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import ShimmerEffect from "../components/elements/ShimmerEffect";
const ReactFormBuilder = React.lazy(() =>
  import("../components/ReactFormBuilderModule/index")
);

export default function ReactFormBuilderModule({ context }) {
  let useSelector = createSelectorHook(context);
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return (
          <BrowserRouter>
            <ReactFormBuilder context={context}></ReactFormBuilder>
          </BrowserRouter>
        );
    }
  }
  let step =
    moduleOptions &&
    moduleOptions.formBuilder &&
    moduleOptions.formBuilder.steps[moduleOptions.formBuilder.activeStep];
  return (
    <div>
      <Suspense
        fallback={
          <ShimmerEffect
            count={(step && step.shimmerCount) || 2}
            visible={true}
            type="list"
          ></ShimmerEffect>
        }
      >
        {renderLayout()}
      </Suspense>
    </div>
  );
}
