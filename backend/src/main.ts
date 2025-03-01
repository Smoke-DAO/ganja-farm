import {
  GardenVector,
  GnajaFarmStorageService,
  Plant,
  PlantType,
  Player,
} from "./models/GnajaFarmModel";
import { SmokenTreasuryService } from "./models/SmokenTreasuryModel";

////////////////////////////////////////
// 🍃 Ganja farm
////////////////////////////////////////
const NEW_PLAYER_COINS = 1;
const SEED_PRICE = 0.1;

const TIME_TO_HARVEST = 24 * 60 * 60;

const SELL_PRICE = {
  [PlantType.OgCush]: 0.5,
};

const MAX_FARMING_SKILL = 10;
const INITIAL_FARMING_SKILL = 1;
const INITIAL_VALUE_SOLD = 0;
const EXP_MULTIPLIER = 3_000_000;

export class GnajaFarm {
  private storage: GnajaFarmStorageService;
  private smokenTreasuryService: SmokenTreasuryService;

  private timeToHarvest: number;

  constructor() {
    this.storage = new GnajaFarmStorageService();
    this.smokenTreasuryService = new SmokenTreasuryService();
    this.timeToHarvest = TIME_TO_HARVEST;
  }

  public async newPlayer(userId: string): Promise<void> {
    if ((await this.storage.getPlayer(userId)) !== null) {
      throw new Error("player already exists");
    }
    await this.storage.setPlayer(
      userId,
      new Player(userId, INITIAL_FARMING_SKILL, INITIAL_VALUE_SOLD)
    );

    await this.storage.setPlantedSeeds(userId, new GardenVector(userId));

    await this.smokenTreasuryService.mintTo(userId, NEW_PLAYER_COINS);

    const balance = await this.smokenTreasuryService.balanceOf(userId);
    log({
      event: "NewPlayer",
      userId: userId,
      balance: balance,
    } as NewPlayerEvent);
  }

  public async levelUp(userId: string): Promise<void> {
    const player = await this.storage.getPlayer(userId);

    if (!player) {
      throw new Error("player not found");
    }

    if (player.farmingSkill >= MAX_FARMING_SKILL) {
      throw new Error("skill already max");
    }

    const newLevel = player.farmingSkill + 1;
    const exp = newLevel * newLevel * EXP_MULTIPLIER;

    if (player.totalValueSold < exp) {
      throw new Error("not enough exp");
    }

    player.levelUpSkill();
    await this.storage.setPlayer(userId, player);

    const balance = await this.smokenTreasuryService.balanceOf(userId);
    log({
      event: "LevelUp",
      userId: userId,
      playerInfo: player,
      balance: balance,
    } as LevelUpEvent);
  }

  public async buySeeds(userId: string, plantType: PlantType, amount: number): Promise<void> {
    const cost = amount * SEED_PRICE;
    const userBalance = await this.smokenTreasuryService.balanceOf(userId);
    if (userBalance < cost) {
      throw new Error("Insufficient funds");
    }

    await this.smokenTreasuryService.burn(userId, cost);

    const playerSeeds = (await this.storage.getPlayerSeeds(userId)) || new Map<PlantType, number>();
    const currentAmount = playerSeeds.get(plantType) || 0;
    playerSeeds.set(plantType, currentAmount + amount);
    await this.storage.setPlayerSeeds(userId, playerSeeds);

    const newBalance = await this.smokenTreasuryService.balanceOf(userId);
    log({
      event: "BuySeeds",
      userId: userId,
      plantType: plantType,
      amountBought: amount,
      cost,
      totalCurrentAmount: currentAmount + amount,
      balance: newBalance,
    } as BuySeedsEvent);
  }

  public async plantSeedAtIndex(
    userId: string,
    plantType: PlantType,
    index: number
  ): Promise<void> {
    const playerSeeds = await this.storage.getPlayerSeeds(userId);
    const currentAmount = playerSeeds?.get(plantType) || 0;
    console.log({ plantType, userId, playerSeeds, currentAmount });

    if (currentAmount < 1) {
      throw new Error("Not enough seeds");
    }

    const gardenVector = (await this.storage.getPlantedSeeds(userId)) || new GardenVector(userId);

    // Check if there's already a plant in this spot
    if (gardenVector.inner[index] !== null) {
      throw new Error("This spot is already occupied");
    }

    playerSeeds?.set(plantType, currentAmount - 1);

    const plant = new Plant(plantType, Date.now());
    gardenVector.plantAtIndex(plant, index);

    await this.storage.setPlayerSeeds(userId, playerSeeds!);
    await this.storage.setPlantedSeeds(userId, gardenVector);

    const balance = await this.smokenTreasuryService.balanceOf(userId);
    log({
      event: "PlantSeed",
      userId: userId,
      plantType: plantType,
      index,
      timestamp: Date.now(),
      balance: balance,
    } as PlantSeedEvent);
  }

  public async harvest(userId: string, indexes: number[]): Promise<void> {
    const time = this.timeToHarvest * 1000; // Convert seconds to milliseconds
    const plantedSeeds = await this.storage.getPlantedSeeds(userId);

    if (!plantedSeeds) {
      throw new Error("No planted seeds found");
    }

    const currentTime = Date.now();

    for (const index of indexes) {
      const plant = plantedSeeds.inner[index];
      if (!plant) {
        throw new Error("No plant at this index");
      }

      const plantedTime = plant.timePlanted;
      if (!plantedTime) {
        throw new Error("Planted time not set");
      }

      const finishTime = plantedTime + time;
      if (currentTime < finishTime) {
        throw new Error("Too early to harvest");
      }

      plantedSeeds.harvestAtIndex(index);

      const playerItems =
        (await this.storage.getPlayerItems(userId)) || new Map<PlantType, number>();
      const currentAmount = playerItems.get(plant.name) || 0;
      playerItems.set(plant.name, currentAmount + 1);
      await this.storage.setPlayerItems(userId, playerItems);

      const balance = await this.smokenTreasuryService.balanceOf(userId);
      log({
        event: "Harvest",
        userId: userId,
        plantType: plant.name,
        index,
        timestamp: currentTime,
        balance: balance,
      } as HarvestEvent);
    }

    await this.storage.setPlantedSeeds(userId, plantedSeeds);
  }

  public async sellItem(userId: string, plantType: PlantType, amount: number): Promise<void> {
    const playerItems = (await this.storage.getPlayerItems(userId)) || new Map<PlantType, number>();
    const currentAmount = playerItems.get(plantType) || 0;

    if (currentAmount < amount) {
      throw new Error("Not enough items to sell");
    }

    playerItems.set(plantType, currentAmount - amount);
    await this.storage.setPlayerItems(userId, playerItems);

    const price = SELL_PRICE[plantType] ?? 0;
    const amountToMint = price * amount;

    const player = await this.storage.getPlayer(userId);
    if (!player) {
      throw new Error("Player not found");
    }

    player.increaseTotalValueSold(amountToMint);

    await this.storage.setPlayer(userId, player);

    await this.smokenTreasuryService.mintTo(userId, amountToMint);

    const balance = await this.smokenTreasuryService.balanceOf(userId);
    log({
      event: "SellItem",
      userId: userId,
      plantType: plantType,
      amountSold: amount,
      valueSold: amountToMint,
      playerInfo: player,
      balance: balance,
    } as SellItemEvent);
  }

  public async getPlayer(id: string): Promise<Player | null> {
    return await this.storage.getPlayer(id);
  }

  public async getSeedAmount(userId: string, item: PlantType): Promise<number> {
    if (!Object.values(PlantType).includes(item)) {
      throw new Error(`Invalid plant type: ${item}`);
    }
    const playerSeeds = await this.storage.getPlayerSeeds(userId);
    if (playerSeeds instanceof Map) {
      return playerSeeds.get(item) || 0;
    } else if (playerSeeds && typeof playerSeeds === "object") {
      return playerSeeds[item] || 0;
    }
    return 0;
  }

  public async getGardenVec(id: string): Promise<GardenVector> {
    return (await this.storage.getPlantedSeeds(id)) || new GardenVector(id);
  }

  public async getItemAmount(id: string, item: PlantType): Promise<number> {
    const playerItems = await this.storage.getPlayerItems(id);
    return playerItems?.get(item) || 0;
  }

  public async canLevelUp(id: string): Promise<boolean> {
    const player = await this.storage.getPlayer(id);
    if (!player) {
      return false;
    }

    if (player.farmingSkill < MAX_FARMING_SKILL) {
      const newLevel = player.farmingSkill + 1;
      const exp = newLevel * newLevel * EXP_MULTIPLIER;
      return player.totalValueSold >= exp;
    }

    return false;
  }

  public async canHarvest(userId: string, index: number): Promise<boolean> {
    const plantedSeeds = await this.storage.getPlantedSeeds(userId);
    if (!plantedSeeds) {
      return false;
    }

    const plant = plantedSeeds.inner[index];
    if (!plant) {
      return false;
    }

    const currentTime = Date.now();
    const plantedTime = plant.timePlanted;
    if (!plantedTime) {
      return false;
    }

    const time = this.timeToHarvest * 1000; // Convert seconds to milliseconds
    const finishTime = plantedTime + time;
    // console.log({
    //   currentTime: `${new Date(currentTime).toLocaleString()} (${currentTime})`,
    //   finishTime: `${new Date(finishTime).toLocaleString()} (${finishTime})`,
    //   timeToHarvest: `${this.timeToHarvest} seconds (${Math.floor(this.timeToHarvest / 3600)} hours)`,
    //   canHarvest: currentTime >= finishTime ? "Ready to harvest!" : `${Math.floor((finishTime - currentTime) / (60 * 60 * 1000))}h ${Math.floor(((finishTime - currentTime) % (60 * 60 * 1000)) / (60 * 1000))}m ${Math.floor(((finishTime - currentTime) % (60 * 1000)) / 1000)}s ${(finishTime - currentTime) % 1000}ms remaining`
    // });
    return currentTime >= finishTime;
  }

  public async getTimeToHarvest(): Promise<number> {
    return this.timeToHarvest;
  }
}

////////////////////////////////////////
// EVENT LOG STRUCTS
////////////////////////////////////////
type NewPlayerEvent = {
  userId: string;
  balance: number;
};

type LevelUpEvent = {
  userId: string;
  playerInfo: Player;
  balance: number;
};

type BuySeedsEvent = {
  userId: string;
  plantType: PlantType;
  amountBought: number;
  cost: number;
  totalCurrentAmount: number;
  balance: number;
};

type PlantSeedEvent = {
  userId: string;
  plantType: PlantType;
  index: number;
  timestamp: number;
  balance: number;
};

type HarvestEvent = {
  userId: string;
  plantType: PlantType;
  index: number;
  timestamp: number;
  balance: number;
};

type SellItemEvent = {
  userId: string;
  plantType: PlantType;
  amountSold: number;
  valueSold: number;
  playerInfo: Player;
  balance: number;
};

function log(
  event:
    | NewPlayerEvent
    | LevelUpEvent
    | BuySeedsEvent
    | PlantSeedEvent
    | HarvestEvent
    | SellItemEvent
): void {
  const timestamp = new Date().toISOString();

  console.log("----------------------------------------");
  console.log(`Timestamp: ${timestamp}`);
  console.log("Event Details:");

  Object.entries(event).forEach(([key, value]) => {
    if (key !== "type") {
      if (typeof value === "object" && value !== null) {
        console.log(`  ${key}:`);
        Object.entries(value).forEach(([subKey, subValue]) => {
          console.log(`    ${subKey}: ${subValue}`);
        });
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
  });

  console.log("----------------------------------------");
}
