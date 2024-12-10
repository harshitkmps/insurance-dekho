import { Condition } from "../config/generic-conditions.interface";

interface Banner {
  links: BannerLinks;
  cta?: BannerCta;
  dateRange: BannerDateRange;
  conditions: Condition[];
}

interface BannerLinks {
  app: string;
  web: string;
}

interface BannerCta {
  app?: string;
  web?: string;
}

interface BannerDateRange {
  from: Date;
  to: Date;
}

export { Banner, BannerDateRange, BannerLinks, BannerCta };
