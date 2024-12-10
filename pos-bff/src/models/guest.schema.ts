import { Column, DataType, Index, Table, Model } from "sequelize-typescript";

@Table({ tableName: "guests" })
export class Guest extends Model {
  @Index
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  uuid: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  mobileHashed: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mobileEncrypted: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mobileMasked: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  gcdCode: string;
}
