import { centralDb } from '../config/db.js';
import { Merchant, VAM } from '@prisma/central-client'; 

export interface CreateMerchantInput {
    name: string;
    email: string;
    phone: string;
    vamId: string;
    hashedPassword: string; 
}

type MerchantWithVams = Merchant & { vams: VAM[] };

export const merchantRepository = {
    
   
    create: async (data: CreateMerchantInput): Promise<MerchantWithVams> => {
        const newMerchant = await centralDb.merchant.create({
            data: {
                name: data.name,
                email: data.email,
                phoneNo: data.phone,
                vams: {
                    create: {
                        vamId: data.vamId,
                        pwd: data.hashedPassword,
                    },
                },
            },
            include: { vams: true }
        });
        return newMerchant;
    },

    findByEmail: async (email: string): Promise<MerchantWithVams | null> => {
        return await centralDb.merchant.findUnique({
            where: { email },
            include: { vams: true },
        });
    },

    
    findById: async (id: number): Promise<Merchant | null> => {
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