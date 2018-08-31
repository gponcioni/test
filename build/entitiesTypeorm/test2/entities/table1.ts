import {Index,Entity, PrimaryColumn, Column, OneToOne, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, RelationId} from "typeorm";
import {test4} from "./test4";


@Entity("table1",{schema:"mydb"})
export class table1 {

    @Column("int",{ 
        nullable:false,
        primary:true,
        name:"idtable1"
        })
    idtable1:number;
        

    @Column("varchar",{ 
        nullable:true,
        length:45,
        name:"table1col"
        })
    table1col:string | null;
        

   
    @OneToMany(type=>test4, test4=>test4.table1_idtable,{ onDelete: 'NO ACTION' })
    tests:test4[];
    
}
