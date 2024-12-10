import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { pick } from "lodash";
import { ConfigService } from "@nestjs/config";
import DBConfigService from "./config-service";
import { createToken, verifyToken } from "../utils/jwt-utils";
import { config } from "../constants/config.constants";

@Injectable()
export default class TokenService {
  constructor(
    private configService: ConfigService,
    private dbConfigService: DBConfigService
  ) {}

  private async getTokenConfigByType(type): Promise<any> {
    const allTokenConfig = await this.dbConfigService.getConfigValueByKey(
      config.JWT_CONFIG
    );
    const tokenConfig: any = allTokenConfig[type];
    if (!tokenConfig) {
      throw new InternalServerErrorException("Token generation not supported");
    }
    return tokenConfig;
  }

  private getJWTAccessKey(type: string): string {
    const envKey = `JWT_ACCESS_${type.toUpperCase()}`;
    const accessKey = this.configService.get(envKey);
    if (!accessKey) {
      throw new BadRequestException("token access key not found");
    }
    return accessKey;
  }

  async generateToken(type: string, userInfo): Promise<string> {
    const tokenConfig: any = await this.getTokenConfigByType(type);
    const payload = pick(userInfo, tokenConfig.payload_keys);
    const expiryTimer = tokenConfig.expiryTimer;
    const accessKey = this.getJWTAccessKey(type);
    return createToken({ data: payload }, accessKey, expiryTimer);
  }

  async verifyToken(type, token): Promise<any> {
    return verifyToken(token, this.getJWTAccessKey(type));
  }
}
