import { Router } from "express";
import * as gnajaFarmController from "./controllers/gnajaFarmController";

const gnajaFarmRouter = Router();

gnajaFarmRouter.get("/", (req, res) => res.send("Ganja farm is alive"));

// Player routes
gnajaFarmRouter.post('/new-player', gnajaFarmController.newPlayer);
gnajaFarmRouter.post('/level-up', gnajaFarmController.levelUp);
gnajaFarmRouter.get('/player/:userId', gnajaFarmController.getPlayer);
gnajaFarmRouter.get('/can-level-up/:userId', gnajaFarmController.canLevelUp);

// Seed routes
gnajaFarmRouter.post('/buy-seeds', gnajaFarmController.buySeeds);
gnajaFarmRouter.get('/seed-amount/:userId/:item', gnajaFarmController.getSeedAmount);

// Garden routes
gnajaFarmRouter.post('/plant-seed', gnajaFarmController.plantSeedAtIndex);
gnajaFarmRouter.post('/harvest', gnajaFarmController.harvest);
gnajaFarmRouter.get('/garden-vector/:userId', gnajaFarmController.getGardenVec);
gnajaFarmRouter.get('/can-harvest/:userId/:index', gnajaFarmController.canHarvest);

// Item routes
gnajaFarmRouter.post('/sell-item', gnajaFarmController.sellItem);
gnajaFarmRouter.get('/item-amount/:userId/:item', gnajaFarmController.getItemAmount);

import * as smokenTreasuryController from "./controllers/SmokenTreasuryController";

// SmokenTreasury routes
gnajaFarmRouter.get('/balance/:owner', smokenTreasuryController.balanceOf);

export { gnajaFarmRouter as router };
