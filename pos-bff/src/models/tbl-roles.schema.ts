import { Column, DataType, Index, Model, Table } from "sequelize-typescript";

@Table({ tableName: "tbl_roles", timestamps: false })
export class RolesTable extends Model {
  @Index
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  display_name: string;

  @Column({ type: DataType.INTEGER })
  status: number;

  @Column({ type: DataType.STRING })
  slug: string;

  @Column({ type: DataType.INTEGER })
  idtree_designation_id: number;
}
