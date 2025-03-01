import mongoose, { Document, Schema } from 'mongoose';

// Интерфейс для SmokenTreasury
export interface ISmokenTreasury extends Document {
    userId: string;
    balance: number;
}

// Схема для SmokenTreasury
const SmokenTreasurySchema = new Schema<ISmokenTreasury>({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 }
});

// Модель для SmokenTreasury
export const SmokenTreasuryModel = mongoose.model<ISmokenTreasury>('SmokenTreasury', SmokenTreasurySchema);

// Интерфейс для TotalSupply
export interface ITotalSupply extends Document {
    totalSupply: number;
}

// Схема для TotalSupply
const TotalSupplySchema = new Schema<ITotalSupply>({
    totalSupply: { type: Number, required: true, default: 0 }
});

// Модель для TotalSupply
export const TotalSupplyModel = mongoose.model<ITotalSupply>('TotalSupply', TotalSupplySchema);

export class SmokenTreasuryService {
    constructor() { }

    private async updateTotalSupply(amount: number): Promise<void> {
        await TotalSupplyModel.findOneAndUpdate(
            {},
            { $inc: { totalSupply: amount } },
            { upsert: true }
        );
    }

    public async mintTo(recipient: string, amount: number): Promise<ISmokenTreasury> {
        const result = await SmokenTreasuryModel.findOneAndUpdate(
            { userId: recipient },
            { $inc: { balance: amount } },
            { upsert: true, new: true }
        );
        await this.updateTotalSupply(amount);
        return result;
    }

    public async transfer(sender: string, recipient: string, amount: number): Promise<void> {
        const senderDoc = await SmokenTreasuryModel.findOne({ userId: sender });
        if (!senderDoc || senderDoc.balance < amount) {
            throw new Error("Insufficient balance");
        }

        await SmokenTreasuryModel.findOneAndUpdate(
            { userId: sender },
            { $inc: { balance: -amount } }
        );
        await SmokenTreasuryModel.findOneAndUpdate(
            { userId: recipient },
            { $inc: { balance: amount } },
            { upsert: true }
        );
    }

    public async burn(owner: string, amount: number): Promise<void> {
        const ownerDoc = await SmokenTreasuryModel.findOne({ userId: owner });
        if (!ownerDoc || ownerDoc.balance < amount) {
            throw new Error("Insufficient balance");
        }

        await SmokenTreasuryModel.findOneAndUpdate(
            { userId: owner },
            { $inc: { balance: -amount } }
        );
        await this.updateTotalSupply(-amount);
    }

    public async balanceOf(owner: string): Promise<number> {
        const ownerDoc = await SmokenTreasuryModel.findOne({ userId: owner });
        return ownerDoc ? ownerDoc.balance : 0;
    }

    public async getTotalSupply(): Promise<number> {
        const totalSupplyDoc = await TotalSupplyModel.findOne();
        return totalSupplyDoc ? totalSupplyDoc.totalSupply : 0;
    }
}
