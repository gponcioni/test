// tslint:disable
import * as Sequelize from 'ts-sequelize';


// table: test1
export interface test1Attribute {
  idtest1:number;
  test1col?:string;
  test3_idtest3:number;
}
export interface test1Instance extends Sequelize.Instance<test1Attribute>, test1Attribute { }
export interface test1Model extends Sequelize.Model<test1Instance, test1Attribute> { }

// table: test4
export interface test4Attribute {
  idtest4:number;
  test4col?:number;
}
export interface test4Instance extends Sequelize.Instance<test4Attribute>, test4Attribute { }
export interface test4Model extends Sequelize.Model<test4Instance, test4Attribute> { }

// table: test3
export interface test3Attribute {
  idtest3:number;
  test3col?:any;
  test4_idtest4:number;
}
export interface test3Instance extends Sequelize.Instance<test3Attribute>, test3Attribute { }
export interface test3Model extends Sequelize.Model<test3Instance, test3Attribute> { }

// table: test2
export interface test2Attribute {
  idtest2:number;
  test2col?:Date;
  test4_idtest4:number;
}
export interface test2Instance extends Sequelize.Instance<test2Attribute>, test2Attribute { }
export interface test2Model extends Sequelize.Model<test2Instance, test2Attribute> { }
