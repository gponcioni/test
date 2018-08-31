import {Index,Entity, PrimaryColumn, Column, OneToOne, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, RelationId} from "typeorm";
import {test4} from "./test4";
import {test1} from "./test1";


@Entity("test3",{schema:"mydb"})
@Index("fk_test3_test41_idx",["test4_idtest",])
export class test3 {

    @Column("int",{ 
        nullable:false,
        primary:true,
        name:"idtest3"
        })
    idtest3:number;
        

    @Column("double",{ 
        nullable:true,
        precision:22,
        name:"test3col"
        })
    test3col:number | null;
        

   
    @OneToOne(type=>test4, test4=>test4.test,{ primary:true, nullable:false,onDelete: 'NO ACTION' })
    @JoinColumn({ name:'test4_idtest4'})
    test4_idtest:test4 | null;


   
    @OneToMany(type=>test1, test1=>test1.test3_idtest,{ onDelete: 'NO ACTION' })
    tests:test1[];
    
}
