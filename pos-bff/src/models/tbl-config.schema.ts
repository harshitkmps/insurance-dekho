import { Column, DataType, Index, Model, Table } from "sequelize-typescript";

@Table({ tableName: "tbl_config", timestamps: false })
export class ConfigTable extends Model {
  @Index
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  configName: string;

  @Column({ type: DataType.STRING })
  dataType: string;

  @Column({ type: DataType.TEXT })
  configValues: string;

  @Column({ type: DataType.INTEGER })
  status: number;

  @Column({ type: DataType.INTEGER })
  updatedBy: number;
}
