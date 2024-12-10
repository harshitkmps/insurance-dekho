import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IndexController } from "./controllers/index.controller";
import { AgentProfileController } from "./controllers/agent-profile-controller";
import { SalesProfileController } from "./controllers/sales-profile.controller";
import { CaseListingController } from "./controllers/case-listing.controller";
import { ContestsController } from "@/src/controllers/contests.controller";
import { GuestController } from "./controllers/guest-controller";
import { FormBuilderController } from "./controllers/form-builder.controller";
import { PointsController } from "./controllers/points.controller";
import { LeadController } from "./controllers/lead.controller";
import { ConfigController } from "./controllers/config.controller";
import { PointsManagementControllerV2 } from "./controllers/points-management-v2.controller";
import { MotorLeadController } from "./controllers/motor-lead.controller";
import { HealthLeadController } from "./controllers/health-lead.controller";
import { FusionController } from "./controllers/fusion.controller";
import { TenantController } from "./controllers/tenant.controller";
import { CaseListingControllerV2 } from "./controllers/case-listing-v2.controller";
import { LoginController } from "./controllers/login.controller";
import { LeadOnboardingController } from "./controllers/lead-onboarding.controller";
import { ManageLeadsController } from "./controllers/manage-leads-controller";
import { UserController } from "./controllers/user.controller";
import { BannerController } from "./controllers/banner-controller";
import { NonMotorLeadController } from "./controllers/non-motor-lead.controller";
import { IFMController } from "./controllers/ifm.controller";
import { IDEdgeOpdController } from "./controllers/idedge-opd-controller";
import { LsqController } from "./controllers/lsq.controller";
import { KycController } from "./controllers/kyc.controller";
import { MMVController } from "./controllers/mmv.controller";
import { HomepageController } from "./controllers/homepage.controller";
import { DocumentController } from "./controllers/document.controller";
import { SupportController } from "./controllers/support.controller";
import { MotorOfflineController } from "./controllers/motor-offline.controller";
import { AgentProfilingController } from "./controllers/agent-profiling.controller";
import { FrontendContentController } from "./controllers/frontend-content.controller";
import { CommonDocController } from "./services/helpers/document-helper";
import { CommunicationController } from "./controllers/communication.controller";
import { MasterController } from "./controllers/master.controller";
import { ShareQuotesController } from "./use-cases/share/controllers/share-quotes.controller";
import { ShareProposalController } from "./use-cases/share/controllers/share-proposal.controller";
import { DashboardController } from "./controllers/dashboard.controller";
import { PartnerListingController } from "./controllers/partner-listing-controller";
import { PersonalAccidentLeadController } from "./controllers/personal-accident-lead.controller";
import { FraudController } from "./use-cases/fraud/controllers/fraud.controller";
import { IdedgeController } from "./controllers/idedge-controller";
import { MotorOnlineController } from "./controllers/motor-online.controller";
import { MeetingController } from "./controllers/partner-connect/meeting.controller";
import { VisitorsController } from "./controllers/partner-connect/visitors.controller";
import { LifeLeadController } from "./controllers/life-lead.controller";
import requestMiddleware from "./middlewares/request.middleware";
import { DatabaseModule } from "./config/database/database.module";
import { HttpModule } from "@nestjs/axios";
import ConfigService from "./services/config-service";
import HeaderFooterService from "./services/header-footer-service";
import { RedisService } from "./services/helpers/cache/redis-cache-impl";
import { RedisRepository } from "./config/database/redis.repository";
import PointsManagementService from "./services/points-management-service";
import { redisClientFactory } from "./config/database/redis-config.service";
import DealerService from "./services/dealer-service";
import { DataProviderFactory } from "./services/cases-listing/data-provider-factory";
import NonMotorLMWCaseListingService from "./services/cases-listing/non-motor-lmw-case-listing-service";
import AgentProfileHelper from "./services/helpers/agent-profile-helper";
import CommonApiHelper from "./services/helpers/common-api-helper";
import PointsService from "./services/helpers/points-service";
import AgentProfileService from "./services/agent-profile-service";
import AgentProfilingService from "./services/agent-profiling-service";
import ApiBrokerageService from "./services/api-brokerage-service";
import ApiPosService from "./services/apipos-service";
import BannerService from "./services/banner-service";
import CaseListingService from "./services/case-listing-v2-service";
import CommonWidgetsService from "./services/common-widgets-service";
import CommunicationService from "./services/communication-service";
import ContestService from "@/src/services/contests.service";
import ContestsCreationService from "@/src/services/contests-creation.service";
import CpsService from "./services/cps-service";
import DashboardService from "./services/dashboard-service";
import DocumentService from "./core/api-helpers/document-service";
import DocumentServiceV2 from "./services/document-v2.service";
import ItmsService from "./core/api-helpers/itms-service";
import EncryptionService from "./services/encryption-service";
import FusionService from "./services/fusion-service";
import GenericAPIService from "./services/generic-api-service";
import GuestService from "./services/guest-service";
import HealthLeadService from "./services/health-lead.service";
import HomepageService from "./services/homepage-service";
import IamService from "./services/iam-service";
import IDEdgeApiService from "./services/idedge-opd-service";
import IdedgeService from "./services/idedge-service";
import IFMApiService from "./services/ifm-service";
import LeadOnboardingService from "./services/leadonboarding-service";
import LifeLeadService from "./services/life-lead.service";
import { LeadMiddlewareService } from "./core/api-helpers/lead-middleware.service";
import LsqService from "./services/lsq-service";
import ManageLeadService from "./services/manage-lead-service";
import MasterAPIService from "./services/master-service";
import MMVService from "./services/mmv-service";
import MotorOfflineService from "./services/motor-offline-service";
import MotorOnlineService from "./services/motor-online-service";
import MotorProposalService from "./services/motor-proposal.service";
import PartnerConnectService from "./services/partner-connect-service";
import PartnerListingService from "./services/partner-listing-service";
import PetProposalService from "./services/pet-proposal.service";
import KycService from "./services/kyc-service";
import QuotesService from "./services/quotes-service";
import RmFlowLeadOnboardingService from "./services/rm-flow-lead-onboarding-service";
import SalesService from "./services/sales-service";
import SmeProposalService from "./services/sme-proposal.service";
import SupportService from "./services/support-service";
import TenantService from "./services/tenant-service";
import TravelProposalService from "./services/travel-proposal.service";
import HospicashService from "./services/hospicash-service";
import UtilityService from "./services/utility-service";
import { MelorraScrapperService } from "./services/melorra-scrapper.service";
import FraudService from "./use-cases/fraud/services/fraud.service";
import ShareQuotesService from "./use-cases/share/services/share-quotes.service";
import ShareProposalService from "./use-cases/share/services/share-proposal.service";
import LOSService from "./services/los-service";
import { HealthLeadMiddlewareService } from "./services/health-lmw.service";
import LeadAddService from "./services/lead-add-service";
import NonMotorLeadService from "./services/non-motor-lead.service";
import NonMotorLmwService from "./services/non-motor-lmw.service";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilter } from "./middlewares/http-exception.filter";
import UserPhoneBookService from "./services/user-phone-book-service";
import { GridPointController } from "./controllers/grid-point.controller";
import GridPointService from "./services/grid-point-service";
import { SalesProfileV2Controller } from "./controllers/sales-profile-v2.controller";
import { LifeOfflineController } from "./controllers/life-offline.controller";
import LifeOfflineService from "./services/life-offline-service";
import { VideoVerificationController } from "./controllers/video-verification.controller";
import UserService from "./services/user-service";
import { EStampController } from "./controllers/estamp.controller";
import { EStampService } from "./services/estamp.service";
import Policyservice from "./services/policy-service";
import { ChatbotController } from "./controllers/chatbot-controller";
import TokenService from "./services/token.service";
import { DialerController } from "./controllers/dialer.controller";
import { CrossSellController } from "./controllers/cross-sell.controller";
import { CrossSellService } from "./services/cross-sell.service";
import { PartnerEventController } from "./controllers/partner-event.controller";
import PartnerEventService from "./services/partner-event.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HttpModule,
  ],
  controllers: [
    IndexController,
    SalesProfileController,
    AgentProfileController,
    CaseListingController,
    ContestsController,
    FormBuilderController,
    PointsController,
    LeadController,
    DocumentController,
    GuestController,
    ConfigController,
    PointsManagementControllerV2,
    LeadOnboardingController,
    LoginController,
    MotorLeadController,
    HealthLeadController,
    FusionController,
    CaseListingControllerV2,
    FraudController,
    TenantController,
    ManageLeadsController,
    BannerController,
    NonMotorLeadController,
    LsqController,
    UserController,
    IFMController,
    IDEdgeOpdController,
    KycController,
    MMVController,
    HomepageController,
    SupportController,
    MotorOfflineController,
    AgentProfilingController,
    FrontendContentController,
    CommunicationController,
    CommonDocController,
    MasterController,
    ShareQuotesController,
    ShareProposalController,
    DashboardController,
    PartnerListingController,
    PersonalAccidentLeadController,
    IdedgeController,
    MotorOnlineController,
    MeetingController,
    VisitorsController,
    LifeLeadController,
    GridPointController,
    SalesProfileV2Controller,
    LifeOfflineController,
    VideoVerificationController,
    EStampController,
    ChatbotController,
    DialerController,
    CrossSellController,
    PartnerEventController,
  ],
  providers: [
    ConfigService,
    HeaderFooterService,
    RedisService,
    RedisRepository,
    PointsManagementService,
    redisClientFactory,
    DealerService,
    DataProviderFactory,
    NonMotorLMWCaseListingService,
    AgentProfileHelper,
    CommonApiHelper,
    PointsService,
    AgentProfileService,
    AgentProfilingService,
    ApiBrokerageService,
    ApiPosService,
    BannerService,
    CaseListingService,
    CommonWidgetsService,
    CommunicationService,
    ContestService,
    ContestsCreationService,
    NonMotorLmwService,
    HealthLeadMiddlewareService,
    CpsService,
    DashboardService,
    DocumentService,
    DocumentServiceV2,
    ItmsService,
    LeadMiddlewareService,
    EncryptionService,
    FusionService,
    GenericAPIService,
    GuestService,
    HealthLeadService,
    HomepageService,
    IamService,
    IDEdgeApiService,
    IdedgeService,
    IFMApiService,
    LeadOnboardingService,
    LifeLeadService,
    LsqService,
    ManageLeadService,
    UserService,
    MasterAPIService,
    MMVService,
    MotorOfflineService,
    MotorOnlineService,
    MotorProposalService,
    PartnerConnectService,
    PartnerListingService,
    PetProposalService,
    KycService,
    QuotesService,
    RmFlowLeadOnboardingService,
    SalesService,
    SmeProposalService,
    SupportService,
    TenantService,
    TravelProposalService,
    HospicashService,
    UtilityService,
    FraudService,
    ShareQuotesService,
    ShareProposalService,
    LOSService,
    LeadAddService,
    NonMotorLeadService,
    NonMotorLmwService,
    UserPhoneBookService,
    GridPointService,
    LifeOfflineService,
    MelorraScrapperService,
    EStampService,
    Policyservice,
    TokenService,
    CrossSellService,
    PartnerEventService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useValue: new NewrelicInterceptor(new NestConfigService()),
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(requestMiddleware)
      .exclude({ path: "health", method: RequestMethod.GET })
      .forRoutes("*");
  }
}
