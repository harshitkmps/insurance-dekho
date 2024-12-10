import React, { Suspense } from "react";
import { createSelectorHook } from "react-redux";
import { BrowserRouter } from "react-router-dom";
const FormBuilder = React.lazy(() =>
  import("../components/FormBuilderModule/index")
);

export default function FormBuilderModule({context}) {
  let useSelector = createSelectorHook(context)
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return (
          <BrowserRouter>
            <FormBuilder context={context}></FormBuilder>
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
