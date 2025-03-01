import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { buttonStyle } from "../../constants";
import type { Modals } from "../../constants";
import { FarmContract } from "../../api/farmContract";

interface HarvestProps {
  contract: FarmContract | null;
  tileArray: number[];
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  setModal: Dispatch<SetStateAction<Modals>>;
  onHarvestSuccess: (position: number) => void;
}

export default function HarvestModal({
  contract,
  tileArray,
  updatePageNum,
  setCanMove,
  setModal,
  onHarvestSuccess,
}: HarvestProps) {
  const [status, setStatus] = useState<"error" | "none" | "loading">("none");

  async function harvestItem() {
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        const result = await contract.functions.harvest(tileArray[0]);
        if (result) {
          onHarvestSuccess(tileArray[0]); // Update tile state
          setModal("plant"); // Close modal
          updatePageNum(); // Update other state
        }
        // setStatus('none');
      } catch (err) {
        console.log("Error in HarvestModal:", err);
        setStatus("error");
      }
      setCanMove(true);
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  // Assume we have a function to check if the item is ready to harvest
  const isReadyToHarvest = (tileIndex: number) => {
    
    // Implement the logic to check if the item is ready to harvest
    // This could involve checking a timestamp or a status from the contract
    return true; // Placeholder, replace with actual logic
  };

  return (
    <div className="harvest-modal">
      {status === "loading" && (
        <BoxCentered>
          <Spinner color="#754a1e" />
        </BoxCentered>
      )}
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
      {status === "none" && isReadyToHarvest(tileArray[0]) && (
        <>
          <div style={styles.items}>Harvest this item?</div>
          <Button css={buttonStyle} onPress={harvestItem}>
            Harvest
          </Button>
        </>
      )}
    </div>
  );
}

const styles = {
  items: {
    marginBottom: "20px",
  },
};
