import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import { FarmContract } from "../../api/farmContract";
import { getBalance } from "../../api/getBalance";

interface ShowCoinsProps {
  updateNum: number;
  contract: FarmContract | null;
  farmCoinAssetID: string;
}

const StyledBox = styled.div`
  line-height: 120%;
  font-family: pressStart2P;
  font-size: 12px;
  text-align: left;
  
  @media (min-width: 640px) {
    max-width: none;
    font-size: 14px;
  }
`;

export default function ShowCoins({
  updateNum,
  contract,
  farmCoinAssetID,
}: ShowCoinsProps) {
  const [balance, setBalance] = useState<number>();

  useEffect(() => {
    async function fetchBalance() {
      const balance = await getBalance(farmCoinAssetID);
      setBalance(balance);
    }
    fetchBalance();
  }, [updateNum, contract]);

  if (balance != null) {
    return <StyledBox>$JOINT: {balance}</StyledBox>;
  }

  return null;
}
