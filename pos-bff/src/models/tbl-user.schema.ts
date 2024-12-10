import { Column, DataType, Index, Table, Model } from "sequelize-typescript";

@Table({ tableName: "tbl_user" })
export class UserTable extends Model {
  @Index
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  userId: number;

  @Column({ type: DataType.STRING })
  uuid: string;

  @Column({ type: DataType.STRING })
  channelPartnerId: string;

  @Column({ type: DataType.INTEGER })
  dealerId: number;

  @Column({ type: DataType.STRING })
  gcd_code: string;

  @Column({ type: DataType.STRING, allowNull: false })
  firstName: string;

  @Column({ type: DataType.STRING, allowNull: true })
  last_name: string;

  @Column({ type: DataType.STRING })
  email: string;

  @Column({ type: DataType.STRING })
  mobile: string;
}
