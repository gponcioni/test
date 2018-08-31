import {Index,Entity, PrimaryColumn, Column, OneToOne, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, RelationId} from "typeorm";
import {table1} from "./table1";
import {test3} from "./test3";


@Entity("test4",{schema:"mydb"})
@Index("fk_test4_table11_idx",["table1_idtable",])
export class test4 {

    @Column("int",{ 
        nullable:false,
        primary:true,
        name:"idtest4"
        })
    idtest4:number;
        

    @Column("tinyint",{ 
        nullable:true,
        width:1,
        name:"test4col"
        })
    test4col:boolean | null;
        

   
    @ManyToOne(type=>table1, table1=>table1.tests,{  nullable:false,onDelete: 'NO ACTION' })
    @JoinColumn({ name:'table1_idtable1'})
    table1_idtable:table1 | null;


   
    @OneToOne(type=>test3, test3=>test3.test4_idtest,{ onDelete: 'NO ACTION' })
    test:test3 | null;

}
