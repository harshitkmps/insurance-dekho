import React, { Suspense, useEffect } from "react";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { getTenantsList } from "../redux/actions";
const IdExclusiveBannerPanel = React.lazy(() =>
  import("../components/PromotionalBannerModule/IdExclusiveBannerPanel")
);

export default function IdExclusiveBannerPanelModule({ context }) {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTenantsList());
  }, [dispatch]);
  function renderLayout() {
    switch (moduleOptions.layout) {
      default:
        return (
          <BrowserRouter>
            <IdExclusiveBannerPanel
              context={context}
              userRole={moduleOptions.role}
              moduleOptions={moduleOptions}
            />
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
