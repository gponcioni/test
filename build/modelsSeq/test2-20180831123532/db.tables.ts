// tslint:disable
import * as path from 'path';
import {Sequelize} from 'ts-sequelize';
import * as def from './db';

export interface ITables {
  table1:def.table1Model;
  test1:def.test1Model;
  test3:def.test3Model;
  test4:def.test4Model;
}

export const getModels = function(seq:Sequelize):ITables {
  const tables:ITables = {
    table1: seq.import(path.join(__dirname, './table1')),
    test1: seq.import(path.join(__dirname, './test1')),
    test3: seq.import(path.join(__dirname, './test3')),
    test4: seq.import(path.join(__dirname, './test4')),
  };
  return tables;
};
