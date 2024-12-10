import { Column, DataType, Table, Model } from "sequelize-typescript";

@Table({ tableName: "tbl_lead" })
export class LeadTable extends Model {
  @Column({ type: DataType.STRING })
  uuid: string;

  @Column({ type: DataType.STRING })
  gcdCode: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING })
  email: string;

  @Column({ type: DataType.STRING })
  mobile: string;
}
