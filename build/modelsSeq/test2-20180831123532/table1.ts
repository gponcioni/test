/* jshint indent: 2 */
// tslint:disable
import {Sequelize} from 'ts-sequelize';
import {DataTypes} from 'ts-sequelize';
import {table1Instance, table1Attribute} from './db';

module.exports = function(sequelize: Sequelize, DataTypes: DataTypes) {
  return sequelize.define<table1Instance, table1Attribute>('table1', {
    idtable1: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    table1col: {
      type: new DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'table1'
  });
};
