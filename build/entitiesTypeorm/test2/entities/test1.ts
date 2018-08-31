import {Index,Entity, PrimaryColumn, Column, OneToOne, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, RelationId} from "typeorm";
import {test3} from "./test3";


@Entity("test1",{schema:"mydb"})
@Index("fk_test1_test3_idx",["test3_idtest",])
export class test1 {

    @Column("int",{ 
        nullable:false,
        primary:true,
        name:"idtest1"
        })
    idtest1:number;
        

   
    @ManyToOne(type=>test3, test3=>test3.tests,{  nullable:false,onDelete: 'NO ACTION' })
    @JoinColumn({ name:'test3_idtest3'})
    test3_idtest:test3 | null;

}
