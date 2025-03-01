import { getTelegramUserId } from "../utils/telegramUser";

export async function getBalance(token: string): Promise<number> {
    try {
        const id = getTelegramUserId();
        const response = await fetch(`/api/balance/${id}`);
        const data = await response.json();
        return data.balance ?? 0;
    } catch (err) {
        console.error("Error in Balance:", err);
        return 0;
    }
}
