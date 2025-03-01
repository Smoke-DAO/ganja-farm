import styled from "@emotion/styled";

import { FarmContract, PlayerOutput } from "../../api/farmContract";
import Inventory from "./Inventory";
import ShowPlayerInfo from "./ShowPlayerInfo";

interface InfoProps {
  player: PlayerOutput | null;
  contract: FarmContract | null;
  updateNum: number;
  seeds: number;
  items: number;
  farmCoinAssetID: string;
}

const Container = styled.div`
  width: 100%;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: fixed;
  bottom: 8px;
  left: 8px;
  width: fit-content;
  z-index: 10;
`;

export default function Info({
  player,
  contract,
  updateNum,
  seeds,
  items,
  farmCoinAssetID,
}: InfoProps) {
  return (
    <Container>
      <InfoWrapper>
        <ShowPlayerInfo
          player={player}
          contract={contract}
          updateNum={updateNum}
          farmCoinAssetID={farmCoinAssetID}
        />
        <Inventory seeds={seeds} items={items} />
      </InfoWrapper>
    </Container>
  );
}
