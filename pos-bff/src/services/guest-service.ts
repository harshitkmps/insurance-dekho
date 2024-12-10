import { Injectable, Logger } from "@nestjs/common";
import { Request } from "express";
import ApiPosService from "./apipos-service";

@Injectable()
export default class GuestService {
  constructor(private apiPosService: ApiPosService) {}

  public async validateGuest(req: Request) {
    try {
      const { name, profileId, mobile, productSelected } = req.body;
      const response = await this.apiPosService.guestLogin(
        name,
        mobile,
        profileId,
        productSelected
      );
      return response;
    } catch (error) {
      Logger.error("Error in guest service", error);
      throw error;
    }
  }
}
