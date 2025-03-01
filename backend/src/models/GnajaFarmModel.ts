import mongoose, { Document, Schema } from 'mongoose';

// Enums
// Interfaces

export enum PlantType {
    OgCush = 'OgCush'
}


export interface IPlayer extends Pick<Player, 'userId' | 'farmingSkill' | 'totalValueSold'> {
}

export interface IPlant extends Pick<Plant, 'name' | 'timePlanted'> {
}
export class Player {
    public userId: string;
    public farmingSkill: number;
    public totalValueSold: number;
    public timeToHarvest: number;

    constructor(userId: string, farmingSkill: number = 1, totalValueSold: number = 0, timeToHarvest: number = 24 * 60 * 60) {
        this.userId = userId;
        this.farmingSkill = farmingSkill;
        this.totalValueSold = totalValueSold;
        this.timeToHarvest = timeToHarvest;
    }

    public levelUpSkill(): void {
        if (this.farmingSkill < 10) {
            this.farmingSkill += 1;
        }
    }

    public increaseTotalValueSold(amount: number): void {
        this.totalValueSold += amount;
    }

}

export class Plant {
    public name: PlantType;
    public timePlanted: number | null;

    constructor(name: PlantType, timePlanted: number | null = null) {
        this.name = name;
        this.timePlanted = timePlanted;
    }

    static new(name: PlantType, timePlanted: number | null = null): Plant {
        return new Plant(name, timePlanted);
    }
}

export class GardenVector {
    public userId: string;
    public inner: (Plant | null)[];

    constructor(userId: string) {
        this.userId = userId;
        this.inner = new Array(10).fill(null);
    }

    public harvestAtIndex(index: number): void {
        if (index < 0 || index >= 10) {
            throw new Error("Invalid index");
        }
        this.inner[index] = null;
    }

    public plantAtIndex(val: Plant, index: number): void {
        if (index < 0 || index >= 10) {
            throw new Error("Invalid index");
        }
        this.inner[index] = val;
    }
}

export interface PlayerSeeds {
    userId: string;
    seeds: Map<PlantType, number>;
}

export interface PlayerItems {
    userId: string;
    items: Map<PlantType, number>;
}

// Mongoose Schemas
const PlayerSchema = new Schema<IPlayer>({
    userId: { type: String, required: true, unique: true },
    farmingSkill: { type: Number, required: true, default: 1 },
    totalValueSold: { type: Number, required: true, default: 0 },
});

const PlantSchema = new Schema<IPlant>({
    name: { type: String, enum: Object.values(PlantType), required: true } as any,
    timePlanted: { type: Number, default: null },
});

const GardenVectorSchema = new Schema<GardenVector>({
    userId: { type: String, required: true, unique: true },
    inner: [{ type: Schema.Types.Mixed, default: null }]
});

const PlayerSeedsSchema = new Schema<PlayerSeeds>({
    userId: { type: String, required: true, unique: true },
    seeds: { type: Map, of: Number, default: new Map() },
});

const PlayerItemsSchema = new Schema<PlayerItems>({
    userId: { type: String, required: true, unique: true },
    items: { type: Map, of: Number, default: new Map() },
});

// Mongoose Models
export const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);
export const GardenVectorModel = mongoose.model<GardenVector>('GardenVector', GardenVectorSchema);
export const PlayerSeedsModel = mongoose.model<PlayerSeeds>('PlayerSeeds', PlayerSeedsSchema);
export const PlayerItemsModel = mongoose.model<PlayerItems>('PlayerItems', PlayerItemsSchema);

// GnajaFarm class (simplified version using Mongoose models)
export class GnajaFarmStorageService {
    async getPlayer(id: string): Promise<Player | null> {
        const playerDoc = await PlayerModel.findOne({ userId: id });
        if (playerDoc) {
            return new Player(
                playerDoc.userId,
                playerDoc.farmingSkill,
                playerDoc.totalValueSold
            );
        }
        return null;
    }

    async getPlayerSeeds(userId: string): Promise<Map<PlantType, number> | undefined> {
        const playerSeeds = await PlayerSeedsModel.findOne({ userId });
        return playerSeeds?.seeds;
    }

    async getPlantedSeeds(userId: string): Promise<GardenVector | null> {
        const gardenVector = await GardenVectorModel.findOne({ userId });
        if (gardenVector) {
            const newGardenVector = new GardenVector(userId);
            newGardenVector.inner = gardenVector.inner;
            return newGardenVector;
        }
        return null;
    }

    async getPlayerItems(userId: string): Promise<Map<PlantType, number> | undefined> {
        const playerItems = await PlayerItemsModel.findOne({ userId });
        return playerItems?.items;
    }

    async setPlayer(id: string, player: IPlayer): Promise<void> {
        await PlayerModel.findOneAndUpdate({ userId: id }, player, { upsert: true });
    }

    async setPlayerSeeds(userId: string, playerSeeds: Map<PlantType, number>): Promise<void> {
        const seedsObject = Object.fromEntries(
            Array.from(playerSeeds.entries()).map(([key, value]) => [key.toString(), value])
        );
        await PlayerSeedsModel.findOneAndUpdate({ userId }, { seeds: seedsObject }, { upsert: true });
    }

    async setPlantedSeeds(userId: string, plantedSeeds: GardenVector): Promise<void> {
        await GardenVectorModel.findOneAndUpdate({ userId }, plantedSeeds, { upsert: true });
    }

    async setPlayerItems(userId: string, playerItems: Map<PlantType, number>): Promise<void> {
        await PlayerItemsModel.findOneAndUpdate({ userId }, { items: playerItems }, { upsert: true });
    }
}



