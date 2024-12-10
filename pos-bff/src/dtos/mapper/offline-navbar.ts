import { ITMS_OFFLINE_STATUS } from "../../constants/itms.constants";
import {
  MOTOR_OFFLINE_NAVBAR,
  OFFLINE_STEPS,
} from "../../constants/motor-offline.constants";

export const buildNavbar = async (itmsStatusId: number) => {
  const navBar = MOTOR_OFFLINE_NAVBAR;
  const allowedSteps = ITMS_OFFLINE_STATUS[itmsStatusId]?.allowedSteps ?? [];
  navBar.steps.every((element) => {
    element.isCompleted = true;
    if (allowedSteps.includes(element?.step)) {
      element.isClickable = true;
      return false;
    }
    return true;
  });
  return navBar;
};

export const buildRedirectionParams = async (
  itmsStatusId: number,
  currnetStep: string
) => {
  const redirectionParams = {
    isRedirect: false,
    redirectPath: "",
  };
  const allowedSteps = ITMS_OFFLINE_STATUS[itmsStatusId]?.allowedSteps ?? [];
  if (!allowedSteps.includes(currnetStep)) {
    redirectionParams["isRedirect"] = true;
    redirectionParams["redirectPath"] = OFFLINE_STEPS[currnetStep]?.path ?? "";
  }
  return redirectionParams;
};
