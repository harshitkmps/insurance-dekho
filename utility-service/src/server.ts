import App from "@/app";
import { IndexController } from "@controllers/index.controller";
import validateEnv from "@utils/validate-env";
import { DownloadController } from "@controllers/download.controller";
import { ConfigController } from "@controllers/config.controller";
import { OnboardingController } from "./controllers/onboarding.controller";
import { UploadController } from "./controllers/upload.controller";
import { FilesComparatorController } from "./controllers/files-comparator.controller";

validateEnv();
const app = new App([
  IndexController,
  DownloadController,
  ConfigController,
  OnboardingController,
  UploadController,
  FilesComparatorController,
]);
app.listen();
