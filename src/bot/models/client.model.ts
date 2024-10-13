import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IClientCreationAttr {
  id: number;
  name: string;
  phone_number: string;
  last_state: string;
}

@Table({ tableName: 'client' })
export class Client extends Model<Client, IClientCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
  })
  id: bigint;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
  })
  last_state: string;
}
