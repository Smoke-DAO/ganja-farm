import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";

import { TILES } from "../constants";


import { FarmContract } from "../api/farmContract";
import GardenTile from "./GardenTile";
import { GardenVectorOutput } from "../api/farmContract";

interface GardenProps {
  tileStates: GardenVectorOutput | undefined;
  contract: FarmContract | null;
  setTileStates: Dispatch<SetStateAction<GardenVectorOutput | undefined>>;
  updateNum: number;
}

export default function Garden({
  tileStates,
  contract,
  setTileStates,
  updateNum,
}: GardenProps) {
  useEffect(() => {
    async function getPlantedSeeds() {
        try {
          const res = await contract?.functions.get_garden_vec();
          if (res) {
            setTileStates(res.value);
          }
        } catch (err) {
          console.log("Error in Garden:", err);
        }
    }
    getPlantedSeeds();
  }, [contract, updateNum]);

  return (
    <>
      {TILES.map((position, index) => (
        <GardenTile
          key={index}
          position={position}
          state={tileStates ? tileStates.inner[index] : undefined}
          updateNum={updateNum}
        />
      ))}
    </>
  );
}
