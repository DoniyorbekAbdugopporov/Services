import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IServiceCreationAttr {
  service_name: string;
}

@Table({ tableName: 'service', timestamps: false })
export class Service extends Model<Service, IServiceCreationAttr> {
  @Column({
    type: DataType.STRING,
  })
  service_name: string;
}
