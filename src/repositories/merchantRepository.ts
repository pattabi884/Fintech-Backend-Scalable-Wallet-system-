import { centralDb } from '../config/db.js';
import { Prisma } from '@prisma/central-client';

//strict typing is enforced 
export interface CreateMerchantInput {
    name: string;
    email: string;
    phone: string;
    vamId: string;
    hashedPassword: string; // we expect the password to be hashed 
}

export const merchantRepository = {
    //an atomic step wher ewe use prisma nested writes to create both merchant and vam 

    create: async (data: CreateMerchantInput) =>{
        const newMerchant = await centralDb.merchant.create({
            data: {
                name: data.name,
                email: data.email,
                phoneNo: data.phone,
                //Nested write 
                vams:{
                    create:{
                        vamId: data.vamId,
                        pwd: data.hashedPassword,
                    },
                },
            },
            //explicitly select what we want to return to ensure we have the ID
            include:{
                vams: true,
            }
        });
    
    return newMerchant;
},

findByEmail: async (email: string) =>{
    return await centralDb.merchant.findUnique({
        where:{ email },
        include:{
            vams: true,
        },
    });
},

findById: async (id: number) => {
    return await centralDb.merchant.findUnique({
        where: { id },
    });
},

checkVamExists: async (vamId: string): Promise<boolean> => {
    const count = await centralDb.vAM.count({
        where: { vamId },
    });
    return count > 0;
}
};
