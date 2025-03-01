import { RequestHandler } from "express";
import { GnajaFarm } from "../main";
import { PlantType } from "../models/GnajaFarmModel";

const gnajaFarm = new GnajaFarm();

export const newPlayer: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  try {
    await gnajaFarm.newPlayer(userId);
    res.status(201).json({ message: "New player created successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in newPlayer" });
    }
  }
};

export const levelUp: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  try {
    await gnajaFarm.levelUp(userId);
    res.status(200).json({ message: "Player leveled up successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in levelUp" });
    }
  }
};

export const buySeeds: RequestHandler = async (req, res) => {
  const { plantType, amount, userId } = req.body;
  try {
    await gnajaFarm.buySeeds(userId, plantType, amount);
    res.status(200).json({ message: "Seeds bought successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in buySeeds" });
    }
  }
};

export const plantSeedAtIndex: RequestHandler = async (req, res) => {
  const { userId, plantType, index } = req.body;
  try {
    await gnajaFarm.plantSeedAtIndex(userId, plantType, index);
    res.status(200).json({ message: "Seed planted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in plantSeedAtIndex" });
    }
  }
};

export const harvest: RequestHandler = async (req, res) => {
  const { indexes, userId } = req.body;
  try {
    await gnajaFarm.harvest(userId, indexes);
    res.status(200).json({ message: "Harvest successful" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in harvest" });
    }
  }
};

export const sellItem: RequestHandler = async (req, res) => {
  const { plantType, amount, userId } = req.body;
  try {
    await gnajaFarm.sellItem(userId, plantType, amount);
    res.status(200).json({ message: "Item sold successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in sellItem" });
    }
  }
};

export const getPlayer: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const player = await gnajaFarm.getPlayer(userId);
    if (player) {
      res.status(200).json(player);
    } else {
      res.status(404).json({ message: "Player not found" });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in getPlayer" });
    }
  }
};

export const getSeedAmount: RequestHandler = async (req, res) => {
  const { userId, item } = req.params;
  try {
    const amount = await gnajaFarm.getSeedAmount(userId, item as unknown as PlantType);
    res.status(200).json({ amount });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in getSeedAmount" });
    }
  }
};

export type GardenVectorOutput = {
  gardenVector: number[];
};

export const getGardenVec: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const gardenVector = await gnajaFarm.getGardenVec(userId);
    res.status(200).json(gardenVector);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in getGardenVec" });
    }
  }
};

export const getItemAmount: RequestHandler = async (req, res) => {
  const { userId, item } = req.params;
  try {
    const amount = await gnajaFarm.getItemAmount(userId, item as unknown as PlantType);
    res.status(200).json({ amount });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in getItemAmount" });
    }
  }
};

export const canLevelUp: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const canLevelUp = await gnajaFarm.canLevelUp(userId);
    res.status(200).json({ canLevelUp });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in canLevelUp" });
    }
  }
};

export const canHarvest: RequestHandler = async (req, res) => {
  const { userId, index } = req.params;
  try {
    const canHarvest = await gnajaFarm.canHarvest(userId, parseInt(index));
    res.status(200).json({ canHarvest });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred in canHarvest" });
    }
  }
};
