import { getTelegramUserId } from "../utils/telegramUser";

export class FarmContract {
    constructor(private contractId: string, private wallet: string) {
        this.contractId = contractId;
        this.wallet = wallet;
    }

    functions = {
        get_player,
        new_player,
        get_garden_vec,
        get_seed_amount,
        get_item_amount,
        sell_item,
        plant_seed,
        buy_seeds,
        can_harvest,
        harvest,
    }

    // For compatibility with existing code
    multiCall(calls: any[]) {
        return {
            get: async () => {
                const results = await Promise.all(calls);
                return { value: results };
            }
        };
    }

    async getAssetId() {
        return "$SMOKEN";
    }
}

export type PlayerOutput = {
    userId: string,
    farmingSkill: number,
    totalValueSold: number
}

 async function get_player(): Promise<{value: PlayerOutput}> {
    const id = getTelegramUserId();
    const response = await fetch(`/api/player/${id}`);
    const data = await response.json();
    return { value: data };
}

async function new_player() {
    const id = getTelegramUserId();

    const response = await fetch('/api/new-player', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: id })
    });
    return await response.json();
}

export type Option<T> = T | undefined;


export enum FoodTypeOutput {
  OG_CUSH = "OgCush",
}

export enum FoodTypeInput {
  OG_CUSH = "OgCush",
}


export type FoodOutput = { 
    name: FoodTypeOutput; 
    timePlanted: number
};

export type GardenVectorOutput = {
    inner: [
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
  ]; 
};

// Garden functions
async function get_garden_vec(): Promise<{value: GardenVectorOutput}> {
    const id = getTelegramUserId();
    const response = await fetch(`/api/garden-vector/${id}`);
    const data = await response.json();
    return { value: data};
}

// Seed functions
async function get_seed_amount(seedType: any) {
    const id = getTelegramUserId();
    const response = await fetch(`/api/seed-amount/${id}/${seedType}`);
    const data = await response.json();
    return data.amount;
}

// Item functions
async function get_item_amount(itemType: any) {
    const id = getTelegramUserId();
    const response = await fetch(`/api/item-amount/${id}/${itemType}`);
    const data = await response.json();
    return data.amount;
}

// Market functions
async function sell_item(plantType: FoodTypeOutput, amount: number) {
    const id = getTelegramUserId();
    const response = await fetch('/api/sell-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: id,
            plantType,
            amount
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Plant functions
//todo add seed type to back
async function plant_seed(seedType: any, index: number) {
    const id = getTelegramUserId();
    const response = await fetch('/api/plant-seed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: id,
            plantType: seedType,
            index
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Harvest functions
async function harvest(index: number) {
    const id = getTelegramUserId();
    const response = await fetch('/api/harvest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: id,
            indexes: [index]
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

async function get_planted_seeds() {
    try {
        const id = getTelegramUserId();
        const response = await fetch(`/api/garden-vector/${id}`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.log("Error in Garden:", err);
    }
}

async function buy_seeds(plantType: any, amount: number) {
    const id = getTelegramUserId();
    try {
        const response = await fetch('/api/buy-seeds', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: id,
                plantType,
                amount
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('An unknown errorx occurred while buying seeds');
    }
}

export async function can_harvest(index: number) {
    const id = getTelegramUserId();
    const response = await fetch(`/api/can-harvest/${id}/${index}`);
    const data = await response.json();
    return data;
}