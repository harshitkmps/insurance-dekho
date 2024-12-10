export interface IConfigSchema {
  _id: string;
  configKey: string;
  configValue: any;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
