// tslint:disable
import * as path from 'path';
import {Sequelize} from 'ts-sequelize';
import * as def from './db';

export interface ITables {
  test1:def.test1Model;
  test4:def.test4Model;
  test3:def.test3Model;
  test2:def.test2Model;
}

export const getModels = function(seq:Sequelize):ITables {
  const tables:ITables = {
    test1: seq.import(path.join(__dirname, './test1')),
    test4: seq.import(path.join(__dirname, './test4')),
    test3: seq.import(path.join(__dirname, './test3')),
    test2: seq.import(path.join(__dirname, './test2')),
  };
  return tables;
};
