
import { getTelegramUserId } from "../../utils/telegramUser.ts";
import Instructions from "./Instructions.tsx";

interface HomeProps {
  isMobile: boolean;
  wallet: any;
}

export default function Home({ isMobile, wallet }: HomeProps) {

  return (
    <div>
      <Instructions isMobile={isMobile} />
      <p style={{ fontSize: "12px", color: "white" }}>Telegram id: {wallet}</p>
    </div>
  );
}
