import { combineReducers } from "redux";
import OTPLoginReducer from "./OTPLoginReducer";
import GoogleLoginReducer from "./GoogleLoginReducer";
import CommonReducer from "./CommonReducer";
import LogoutReducer from "./LogoutReducer";
import LearningReducer from "./LearningReducer";
import PromotionalBannerReducer from "./PromotionalBannerReducer";
import FormBuilderReducer from "./FormBuilderReducer";
import ReactFormBuilderReducer from "./ReactFormBuilderReducer";
import KycReducer from "./KycReducer";
import IdExclusiveBannerReducer from "./IdExclusiveBannerReducer";

const RootReducers = combineReducers({
  OTPLoginReducer,
  GoogleLoginReducer,
  CommonReducer,
  LogoutReducer,
  LearningReducer,
  PromotionalBannerReducer,
  FormBuilderReducer,
  ReactFormBuilderReducer,
  KycReducer,
  IdExclusiveBannerReducer,
});

export default RootReducers;
