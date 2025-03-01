import styled from "@emotion/styled";

import { getTelegramUserId } from '../../utils/telegramUser';

import ShowCoins from "./ShowCoins";
import { FarmContract, PlayerOutput } from "../../api/farmContract";

interface PlayerProps {
  player: PlayerOutput | null;
  contract: FarmContract | null;
  updateNum: number;
  farmCoinAssetID: string;
}

const StyledBox = styled.div`
  font-family: pressStart2P;
  font-size: 12px;
  text-align: left;
  line-height: 120%;
  
  @media (min-width: 640px) {
    max-width: none;
    font-size: 14px;
  }
`;

const PlayerInfoContainer = styled.div`
  background: #ac7339;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  padding: 10px 0 10px 20px;
  border-radius: 8px;
  border: 3px solid #754a1e;

  @media (min-width: 640px) {
    width: 200px;
    height: 80px;
  }
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

export default function ShowPlayerInfo({
  player,
  contract,
  updateNum,
  farmCoinAssetID,
}: PlayerProps) {
  let valSold;
  if (player !== null) {
    valSold = player.totalValueSold;
  }
  const telegramUserId = getTelegramUserId();
  return (
    <PlayerInfoContainer>
      <FlexColumn>
        {/* <StyledBox>Value Sold: {valSold ?? "0"}</StyledBox> */}
        <ShowCoins
          contract={contract}
          updateNum={updateNum}
          farmCoinAssetID={farmCoinAssetID}
        />
        {/* {telegramUserId != null && <StyledBox>User id: {getTelegramUserId()}</StyledBox>} */}
      </FlexColumn>
    </PlayerInfoContainer>
  );
}
