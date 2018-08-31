// tslint:disable
import * as Sequelize from 'ts-sequelize';


// table: table1
export interface table1Attribute {
  idtable1:number;
  table1col?:string;
}
export interface table1Instance extends Sequelize.Instance<table1Attribute>, table1Attribute { }
export interface table1Model extends Sequelize.Model<table1Instance, table1Attribute> { }

// table: test1
export interface test1Attribute {
  idtest1:number;
  test3_idtest3:number;
}
export interface test1Instance extends Sequelize.Instance<test1Attribute>, test1Attribute { }
export interface test1Model extends Sequelize.Model<test1Instance, test1Attribute> { }

// table: test3
export interface test3Attribute {
  idtest3:number;
  test3col?:any;
  test4_idtest4:number;
}
export interface test3Instance extends Sequelize.Instance<test3Attribute>, test3Attribute { }
export interface test3Model extends Sequelize.Model<test3Instance, test3Attribute> { }

// table: test4
export interface test4Attribute {
  idtest4:number;
  test4col?:number;
  table1_idtable1:number;
}
export interface test4Instance extends Sequelize.Instance<test4Attribute>, test4Attribute { }
export interface test4Model extends Sequelize.Model<test4Instance, test4Attribute> { }
