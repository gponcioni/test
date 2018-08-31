/* jshint indent: 2 */
// tslint:disable
import {Sequelize} from 'ts-sequelize';
import {DataTypes} from 'ts-sequelize';
import {test1Instance, test1Attribute} from './db';

module.exports = function(sequelize: Sequelize, DataTypes: DataTypes) {
  return sequelize.define<test1Instance, test1Attribute>('test1', {
    idtest1: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    test1col: {
      type: new DataTypes.STRING(45),
      allowNull: true
    },
    test3_idtest3: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'test3',
        key: 'idtest3'
      }
    }
  }, {
    tableName: 'test1'
  });
};
