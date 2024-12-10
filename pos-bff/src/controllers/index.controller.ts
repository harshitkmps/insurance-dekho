import { Controller, Get, Logger, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller()
@ApiTags("Index")
export class IndexController {
  @Get("/health")
  index() {
    return "OK";
  }

  @Get(["/auth-test", "v1/event-attendence"])
  @ApiOperation({
    summary: "Bearer token check",
  })
  @UserAuth()
  authTest(@Req() req: ReqWithUser) {
    Logger.log(`request with body `, req.body);
    return "OK";
  }
}
