import React, { Suspense } from "react";
import "./App.scss";
import { createDispatchHook } from "react-redux";
import { setModuleOptions } from "./redux/actions";
import ShimmerEffect from "./components/elements/ShimmerEffect";
const LoginModule = React.lazy(() => import("./modules/LoginModule"));
const LogoutModule = React.lazy(() => import("./modules/LogoutModule"));
const ReviewModule = React.lazy(() => import("./modules/ReviewModule"));
const IdExclusiveBannerModule = React.lazy(() => import("./modules/IdExclusiveBannerPanelModule"));

const FingerPrintModule = React.lazy(() =>
  import("./modules/FingerPrintModule")
);
const LearningModule = React.lazy(() => import("./modules/LearningModule"));
const PromotionalBannerModule = React.lazy(() =>
  import("./modules/PromotionalBannerModule")
);
const FormBuilderModule = React.lazy(() =>
  import("./modules/FormBuilderModule")
);
const ReactFormBuilderModule = React.lazy(() =>
  import("./modules/ReactFormBuilderModule")
);
const VideoPanelModule = React.lazy(() => import("./modules/VideoPanelModule"));
const BannerPanelModule = React.lazy(() =>
  import("./modules/BannerPanelModule")
);
const DefaultModule = React.lazy(() => import("./modules/DefaultModule"));
const KycModule = React.lazy(() => import("./modules/KycModule"));

export default function App({ moduleName, moduleOptions, context }) {
  let useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  dispatch(setModuleOptions({ moduleName, moduleOptions }));
  function renderModule() {
    switch (moduleName) {
      case "LoginModule":
        return <LoginModule context={context}></LoginModule>;
      case "LogoutModule":
        return <LogoutModule context={context}></LogoutModule>;
      case "ReviewModule":
        return <ReviewModule context={context}></ReviewModule>;
      case "FingerPrintModule":
        return <FingerPrintModule context={context}></FingerPrintModule>;
      case "LearningModule":
        return <LearningModule context={context}></LearningModule>;
      case "PromotionalBannerModule":
        return (
          <PromotionalBannerModule context={context}></PromotionalBannerModule>
        );
      case "FormBuilderModule":
        return <FormBuilderModule context={context}></FormBuilderModule>;
      case "ReactFormBuilderModule":
        return (
          <ReactFormBuilderModule context={context}></ReactFormBuilderModule>
        );
      case "VideoPanelModule":
        return <VideoPanelModule context={context}></VideoPanelModule>;
      case "BannerPanelModule":
        return <BannerPanelModule context={context}></BannerPanelModule>;
      case "KycModule":
        return <KycModule context={context}></KycModule>;
      case "IdExclusiveBannerModule":
        return <IdExclusiveBannerModule context={context} />;
      //need to register the module
      default:
        return <DefaultModule context={context}></DefaultModule>;
    }
  }
  let step = moduleOptions && moduleOptions.formBuilder && moduleOptions.formBuilder.steps[moduleOptions.formBuilder.activeStep]
  return (
    <div>
      <Suspense fallback={<ShimmerEffect count={step && step.shimmerCount || 2} visible={true} type="list"></ShimmerEffect>}>{renderModule()}</Suspense>
    </div>
  );
}
