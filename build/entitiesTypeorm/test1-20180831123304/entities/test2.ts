import {Index,Entity, PrimaryColumn, Column, OneToOne, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, RelationId} from "typeorm";
import {test4} from "./test4";


@Entity("test2",{schema:"mydb"})
@Index("fk_test2_test41_idx",["test4_idtest",])
export class test2 {

    @Column("int",{ 
        nullable:false,
        primary:true,
        name:"idtest2"
        })
    idtest2:number;
        

    @Column("datetime",{ 
        nullable:true,
        name:"test2col"
        })
    test2col:Date | null;
        

   
    @ManyToOne(type=>test4, test4=>test4.tests,{  nullable:false,onDelete: 'NO ACTION' })
    @JoinColumn({ name:'test4_idtest4'})
    test4_idtest:test4 | null;

}
