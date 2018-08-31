/* jshint indent: 2 */
// tslint:disable
import {Sequelize} from 'ts-sequelize';
import {DataTypes} from 'ts-sequelize';
import {test3Instance, test3Attribute} from './db';

module.exports = function(sequelize: Sequelize, DataTypes: DataTypes) {
  return sequelize.define<test3Instance, test3Attribute>('test3', {
    idtest3: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    test3col: {
      type: "DOUBLE",
      allowNull: true
    },
    test4_idtest4: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'test4',
        key: 'idtest4'
      }
    }
  }, {
    tableName: 'test3'
  });
};
