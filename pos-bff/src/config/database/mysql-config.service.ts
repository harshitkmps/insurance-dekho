import { Guest } from "@/src/models/guest.schema";
import { BusinessUnitTable } from "@/src/models/tbl-business-unit.schema";
import { ConfigTable } from "@/src/models/tbl-config.schema";
import { LeadTable } from "@/src/models/tbl-lead.schema";
import { RolesTable } from "@/src/models/tbl-roles.schema";
import { UserTable } from "@/src/models/tbl-user.schema";
import { ConfigService } from "@nestjs/config";
import { SequelizeModuleOptions } from "@nestjs/sequelize";

export const sqlConfigService = async (
  configService: ConfigService
): Promise<SequelizeModuleOptions> => {
  const host = await configService.get("MYSQL_HOST");
  const username = await configService.get("MYSQL_USER");
  const password = await configService.get("MYSQL_PASSWORD");
  const database = await configService.get("MYSQL_DATABASE");
  const isDevEnv: boolean =
    (await configService.get("NODE_ENV")) !== "production";
  return {
    dialect: "mariadb",
    host,
    port: 3306,
    username,
    password,
    database,
    models: [
      Guest,
      ConfigTable,
      LeadTable,
      UserTable,
      RolesTable,
      BusinessUnitTable,
    ],
    define: {
      underscored: true,
    },
    dialectOptions: {
      useUTC: false, // for reading from database
    },
    // eslint-disable-next-line no-console
    logging: isDevEnv && console.log,
    logQueryParameters: isDevEnv,
  };
};
