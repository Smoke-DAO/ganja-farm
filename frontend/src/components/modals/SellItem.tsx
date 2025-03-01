import { Button } from "@fuel-ui/react";
import { bn } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { buttonStyle } from "../../constants";
import { FarmContract, FoodTypeInput, FoodTypeOutput } from "../../api/farmContract";
import Loading from "../Loading";

interface SellItemProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  items: number;
  setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function SellItem({
  contract,
  updatePageNum,
  items,
  setCanMove,
}: SellItemProps) {
  const [status, setStatus] = useState<"error" | "none" | "loading">("none");

  async function sellItems() {
    if (contract) {
      try {
        setStatus("loading");
        setCanMove(false);
        setStatus("none");
        await contract.functions.sell_item(FoodTypeOutput.OG_CUSH,items, );
        updatePageNum();
      } catch (err) {
        console.log("Error in SellItem:", err);
        setStatus("error");
      }
      setCanMove(true);
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  return (
    <>
      <div className="market-header sell">Sell Items</div>
      {status === "loading" && <Loading />}
      {status === "error" && (
        <div>
          <p>Something went wrong!</p>
          <Button
            css={buttonStyle}
            onPress={() => {
              setStatus("none");
              updatePageNum();
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      {status === "none" && (
        <Button css={buttonStyle} variant="outlined" onPress={sellItems}>
          Sell All Items
        </Button>
      )}
    </>
  );
}
