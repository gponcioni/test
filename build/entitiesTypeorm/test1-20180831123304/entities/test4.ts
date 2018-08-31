import {Index,Entity, PrimaryColumn, Column, OneToOne, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, RelationId} from "typeorm";
import {test2} from "./test2";
import {test3} from "./test3";


@Entity("test4",{schema:"mydb"})
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
        

   
    @OneToMany(type=>test2, test2=>test2.test4_idtest,{ onDelete: 'NO ACTION' })
    tests:test2[];
    

   
    @OneToOne(type=>test3, test3=>test3.test4_idtest,{ onDelete: 'NO ACTION' })
    test:test3 | null;

}
