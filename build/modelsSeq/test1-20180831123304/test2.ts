/* jshint indent: 2 */
// tslint:disable
import {Sequelize} from 'ts-sequelize';
import {DataTypes} from 'ts-sequelize';
import {test2Instance, test2Attribute} from './db';

module.exports = function(sequelize: Sequelize, DataTypes: DataTypes) {
  return sequelize.define<test2Instance, test2Attribute>('test2', {
    idtest2: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    test2col: {
      type: new DataTypes.DATE(),
      allowNull: true
    },
    test4_idtest4: {
      type: new DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'test4',
        key: 'idtest4'
      }
    }
  }, {
    tableName: 'test2'
  });
};
