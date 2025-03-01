import axios from 'axios';
import { PlantType } from '../src/models/GnajaFarmModel';

const API_URL = 'http://localhost:3001/api/v1'; // Adjust this to your API's URL

describe('Gnaja Farm API Tests', () => {
    const userId = generateRandomUserId();

    beforeAll(async () => {
        // Setup: Ensure the database is clean before running tests
        // You might want to add an endpoint to reset the database for testing purposes
    });
    test('Can create a new player', async () => {
        try {
            let playerResponse = await axios.get(`${API_URL}/player/${userId}`);
            expect(playerResponse.status).toBe(404);
        } catch (error) {
            console.log(error);
        }

        const response = await axios.post(`${API_URL}/new-player`, { userId });

        expect(response.status).toBe(201);
        expect(response.data.message).toBe('New player created successfully');

        // Check player attributes
        const playerResponse = await axios.get(`${API_URL}/player/${userId}`);
        expect(playerResponse.status).toBe(200);
        expect(playerResponse.data).toHaveProperty('userId', userId);
        expect(playerResponse.data).toHaveProperty('farmingSkill', 1);
        expect(playerResponse.data).toHaveProperty('totalValueSold', 0);

        // Check initial seed amount
        const seedResponse = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);
        expect(seedResponse.status).toBe(200);
        expect(seedResponse.data.amount).toBe(0);

        // Check initial garden vector
        const gardenResponse = await axios.get(`${API_URL}/garden-vector/${userId}`);
        expect(gardenResponse.status).toBe(200);
        expect(gardenResponse.data.inner).toEqual(new Array(10).fill(null));

        // Check initial item amount
        const itemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        expect(itemResponse.status).toBe(200);
        expect(itemResponse.data.amount).toBe(0);
    });

    test('Cannot create a player twice', async () => {
        await expect(axios.post(`${API_URL}/new-player`, { userId })).rejects.toThrow();
    });

    test('Can buy seeds', async () => {
        const initialBalance = await axios.get(`${API_URL}/balance/${userId}`);
        const initialSeedAmount = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);

        const amount = 5;
        const response = await axios.post(`${API_URL}/buy-seeds`, {
            userId,
            plantType: PlantType.OgCush,
            amount
        });

        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Seeds bought successfully');

        const finalBalance = await axios.get(`${API_URL}/balance/${userId}`);
        const finalSeedAmount = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);

        expect(finalBalance.data.balance).toBe(initialBalance.data.balance - (750000 * amount));
        expect(finalSeedAmount.data.amount).toBe(initialSeedAmount.data.amount + amount);

        expect(finalBalance.data.balance).toBe(996250000);
    });
    test('Can get seed amount', async () => {
        // Check initial seed amount
        const initialResponse = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);
        expect(initialResponse.status).toBe(200);
        expect(initialResponse.data.amount).toBe(5);

        // Buy more seeds
        const buyAmount = 3;
        await axios.post(`${API_URL}/buy-seeds`, {
            userId,
            plantType: PlantType.OgCush,
            amount: buyAmount
        });

        // Check updated seed amount
        const updatedResponse = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);
        expect(updatedResponse.status).toBe(200);
        expect(updatedResponse.data.amount).toBe(8); // 5 initial + 3 bought
    });
    test('Can plant seeds', async () => {
        // Get initial seed amount
        const initialSeedResponse = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);
        const initialSeedAmount = initialSeedResponse.data.amount;

        // Plant seeds in specific indexes
        const indexes = [0, 1, 2, 3, 4];
        for (const index of indexes) {
            const response = await axios.post(`${API_URL}/plant-seed`, {
                userId,
                plantType: PlantType.OgCush,
                index
            });
            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Seed planted successfully');
        }

        // Check garden vector after planting
        const gardenResponse = await axios.get(`${API_URL}/garden-vector/${userId}`);
        expect(gardenResponse.status).toBe(200);
        const garden = gardenResponse.data.inner;

        // Verify plants are in correct spots and other spots are empty
        for (let i = 0; i < 10; i++) {
            if (indexes.includes(i)) {
                expect(garden[i]).not.toBeNull();
                expect(garden[i].name).toBe(PlantType.OgCush);
            } else {
                expect(garden[i]).toBeNull();
            }
        }

        // Try to plant in an occupied spot
        await expect(axios.post(`${API_URL}/plant-seed`, {
            userId,
            plantType: PlantType.OgCush,
            index: 0
        })).rejects.toThrow();

        // Plant in a new spot
        const newIndex = 5;
        const newPlantResponse = await axios.post(`${API_URL}/plant-seed`, {
            userId,
            plantType: PlantType.OgCush,
            index: newIndex
        });
        expect(newPlantResponse.status).toBe(200);

        // Check updated garden vector
        const updatedGardenResponse = await axios.get(`${API_URL}/garden-vector/${userId}`);
        expect(updatedGardenResponse.data.inner[newIndex]).not.toBeNull();

        // Check final seed amount
        const finalSeedResponse = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);
        const finalSeedAmount = finalSeedResponse.data.amount;
        expect(finalSeedAmount).toBe(initialSeedAmount - indexes.length - 1);
    });

    test('Can get garden vector', async () => {
        const response = await axios.get(`${API_URL}/garden-vector/${userId}`);
        expect(response.status).toBe(200);
        expect(response.data.inner.filter((plant: any) => plant !== null).length).toBe(6);
    });

    test('Can harvest and check item amount', async () => {
        // Get initial item amount
        const initialItemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        const initialItemAmount = initialItemResponse.data.amount;

        // Perform harvest
        const response = await axios.post(`${API_URL}/harvest`, {
            userId,
            indexes: [0]
        });
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Harvest successful');

        // Check if item amount increased
        const updatedItemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        const updatedItemAmount = updatedItemResponse.data.amount;
        expect(updatedItemAmount).toBe(initialItemAmount + 1);

        // Try to harvest the same index again
        await expect(axios.post(`${API_URL}/harvest`, {
            userId,
            indexes: [0]
        })).rejects.toThrow();

        // Verify item amount didn't change after failed harvest
        const finalItemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        const finalItemAmount = finalItemResponse.data.amount;
        expect(finalItemAmount).toBe(updatedItemAmount);
    });

    test('Can get item amount', async () => {
        const response = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        expect(response.status).toBe(200);
        expect(response.data.amount).toBe(1);
    });

    test('Can harvest multiple', async () => {
        // Get initial item amount
        const initialItemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        const initialItemAmount = initialItemResponse.data.amount;

        // Perform harvest
        const response = await axios.post(`${API_URL}/harvest`, {
            userId,
            indexes: [1, 2]
        });
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Harvest successful');

        // Check if item amount increased by 2
        const updatedItemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        const updatedItemAmount = updatedItemResponse.data.amount;
        expect(updatedItemAmount).toBe(initialItemAmount + 2);

        // Check if garden vector was updated
        const gardenResponse = await axios.get(`${API_URL}/garden-vector/${userId}`);
        expect(gardenResponse.data.inner[1]).toBeNull();
        expect(gardenResponse.data.inner[2]).toBeNull();
    });
    test('Can sell item', async () => {
        // Get initial item amount and balance
        const initialItemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        const initialItemAmount = initialItemResponse.data.amount;
        const initialBalanceResponse = await axios.get(`${API_URL}/balance/${userId}`);
        const initialBalance = initialBalanceResponse.data.balance;

        // Sell items
        const response = await axios.post(`${API_URL}/sell-item`, {
            userId,
            plantType: PlantType.OgCush,
            amount: 2
        });
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Item sold successfully');

        // Check if item amount decreased
        const updatedItemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        const updatedItemAmount = updatedItemResponse.data.amount;
        expect(updatedItemAmount).toBe(initialItemAmount - 2);

        // Check if balance increased correctly
        const updatedBalanceResponse = await axios.get(`${API_URL}/balance/${userId}`);
        const updatedBalance = updatedBalanceResponse.data.balance;
        expect(updatedBalance).toBe(initialBalance + 2 * 7_500_000); // OgCush sells for 7,500,000 each

        // Добавим проверку точного баланса после продажи
        expect(updatedBalance).toBe(1009000000);
    });

    test('Can check if player can level up', async () => {
        const response = await axios.get(`${API_URL}/can-level-up/${userId}`);
        expect(response.status).toBe(200);
        expect(response.data.canLevelUp).toBe(true);
    });

    test('Can level up', async () => {
        const response = await axios.post(`${API_URL}/level-up`, { userId });
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Player leveled up successfully');
    });

    test('Can get player info', async () => {
        const response = await axios.get(`${API_URL}/player/${userId}`);
        expect(response.status).toBe(200);
        expect(response.data.farmingSkill).toBe(2);
        expect(response.data.totalValueSold).toBe(15000000);
    });

    test('Final balance check', async () => {
        const finalBalanceResponse = await axios.get(`${API_URL}/balance/${userId}`);
        expect(finalBalanceResponse.status).toBe(200);
        expect(finalBalanceResponse.data.balance).toBe(1009000000);
    });

    test('Total value sold check', async () => {
        const playerResponse = await axios.get(`${API_URL}/player/${userId}`);
        expect(playerResponse.status).toBe(200);
        expect(playerResponse.data.totalValueSold).toBe(15000000);
    });

    test('Remaining seeds check', async () => {
        const seedResponse = await axios.get(`${API_URL}/seed-amount/${userId}/${PlantType.OgCush}`);
        expect(seedResponse.status).toBe(200);
        expect(seedResponse.data.amount).toBe(2); // 8 купленных - 6 посаженных
    });

    test('Remaining items check', async () => {
        const itemResponse = await axios.get(`${API_URL}/item-amount/${userId}/${PlantType.OgCush}`);
        expect(itemResponse.status).toBe(200);
        expect(itemResponse.data.amount).toBe(1); // 3 собранных - 2 проданных
    });
});

function generateRandomUserId(length: number = 12): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
