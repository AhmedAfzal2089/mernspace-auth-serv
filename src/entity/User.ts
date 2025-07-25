import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false }) // the password filed will not come in the record if    select:false
    password: string;

    @Column()
    role: string;

    @ManyToOne(() => Tenant)
    tenant: Tenant | null;
}
