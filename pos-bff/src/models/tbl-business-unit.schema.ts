import { Column, DataType, Index, Model, Table } from "sequelize-typescript";

@Table({ tableName: "tbl_business_units", timestamps: false })
export class BusinessUnitTable extends Model {
  @Index
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.INTEGER })
  status: number;
}
