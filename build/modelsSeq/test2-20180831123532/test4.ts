/* jshint indent: 2 */
// tslint:disable
import {Sequelize} from 'ts-sequelize';
import {DataTypes} from 'ts-sequelize';
import {test4Instance, test4Attribute} from './db';

module.exports = function(sequelize: Sequelize, DataTypes: DataTypes) {
  return sequelize.define<test4Instance, test4Attribute>('test4', {
    idtest4: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    test4col: {
      type: new DataTypes.INTEGER(1),
      allowNull: true
    },
    table1_idtable1: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'table1',
        key: 'idtable1'
      }
    }
  }, {
    tableName: 'test4'
  });
};
