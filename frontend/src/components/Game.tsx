import { cssObj } from "@fuel-ui/css";
import { Box, Button } from "@fuel-ui/react";
import type { KeyboardControlsEntry } from "@react-three/drei";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BN } from "fuels";
import { useState, useEffect, useMemo, Suspense } from "react";

import type { Modals } from "../constants";
import { Controls, buttonStyle } from "../constants";

import { FarmContract, FoodTypeInput, GardenVectorOutput } from "../api/farmContract";

import Background from "./Background";
import Camera from "./Camera";
import Garden from "./Garden";
import Loading from "./Loading";
import MobileControlButtons from "./MobileControls";
import NewPlayer from "./NewPlayer";
import Player from "./Player";
import HarvestModal from "./modals/HarvestModal";
import MarketModal from "./modals/MarketModal";
import PlantModal from "./modals/PlantModal";
import Info from "./show/Info";

interface GameProps {
  contract: FarmContract | null;
  isMobile: boolean;
  farmCoinAssetID: string;
}

export type Position =
  | "left-top"
  | "center-top"
  | "right-top"
  | "left-bottom"
  | "center-bottom"
  | "right-bottom";
export type MobileControls = "none" | "up" | "down" | "left" | "right";

export default function Game({
  contract,
  isMobile,
  farmCoinAssetID,
}: GameProps) {
  const [modal, setModal] = useState<Modals>("none");
  const [tileStates, setTileStates] = useState<
    GardenVectorOutput | undefined
  >();
  const [tileArray, setTileArray] = useState<number[]>([]);
  const [player, setPlayer] = useState<any | null>(null);
  const [status, setStatus] = useState<"error" | "none" | "loading">("loading");
  const [updateNum, setUpdateNum] = useState<number>(0);
  const [seeds, setSeeds] = useState<number>(0);
  const [items, setItems] = useState<number>(0);
  const [canMove, setCanMove] = useState<boolean>(true);
  const [playerPosition, setPlayerPosition] = useState<Position>("left-top");
  const [mobileControlState, setMobileControlState] =
    useState<MobileControls>("none");

  useEffect(() => {
    async function getPlayerInfo() {
      if (contract) {
        try {
          const { value: Some } = await contract.functions.get_player();
          if (Some?.farmingSkill >= 1) {
            setPlayer(Some);
            const seedType: FoodTypeInput = FoodTypeInput.OG_CUSH;

            // Get seed and item amounts
            const [seedAmount, itemAmount] = await Promise.all([
              contract.functions.get_seed_amount(seedType),
              contract.functions.get_item_amount(seedType)
            ]);

            setSeeds(seedAmount);
            setItems(itemAmount);
          }
        } catch (err) {
          console.log("Error in Game:", err);
          setStatus("error");
        }
        setStatus("none");
      }

    }

    getPlayerInfo();

    const interval = setInterval(() => {
      setUpdateNum(updateNum + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [contract, updateNum]);

  const updatePageNum = () => {
    setTimeout(() => {
      setUpdateNum(updateNum + 1);
    }, 3000);
  };
  const handlePlantSuccess = (position: number) => {
    setSeeds((prev) => prev - 1);

    setTileStates((prev) => {
      if (!prev) return prev;
      const taiOffset = BigInt(2 ** 62) + BigInt(10);
      const currentTime = BigInt(Math.floor(Date.now() / 1000)) + taiOffset;
      const newInner = [...prev.inner];
      newInner[position] = {
        name: "OgCush",
        timePlanted: new BN(currentTime.toString()),
      } as any;
      return {
        inner: newInner,
      } as GardenVectorOutput;
    });
  };
  const onHarvestSuccess = (position: number) => {
    setItems((prev) => prev + 1);
    setTileStates((prev) => {
      if (!prev) return prev;

      const newInner = [...prev.inner];
      newInner[position] = undefined;

      return {
        inner: newInner,
      } as GardenVectorOutput;
    });
  };
  const controlsMap = useMemo<KeyboardControlsEntry[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "w", "W"] },
      { name: Controls.back, keys: ["ArrowDown", "s", "S"] },
      { name: Controls.left, keys: ["ArrowLeft", "a", "A"] },
      { name: Controls.right, keys: ["ArrowRight", "d", "D"] },
    ],
    [],
  );
  return (
    <Box css={styles.canvasContainer}>
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
      {status === "loading" && <Loading />}
      {status === "none" && (
        <>
          <Canvas orthographic>
            <Camera playerPosition={playerPosition} isMobile={isMobile} />
            <Suspense fallback={null}>
              <Background />
              {/* GARDEN */}
              <Garden
                tileStates={tileStates}
                setTileStates={setTileStates}
                contract={contract}
                updateNum={updateNum}
              />

              {/* PLAYER */}
              {player !== null && (
                <KeyboardControls map={controlsMap}>
                  <Player
                    tileStates={tileStates}
                    modal={modal}
                    setModal={setModal}
                    setTileArray={setTileArray}
                    setPlayerPosition={setPlayerPosition}
                    playerPosition={playerPosition}
                    canMove={canMove}
                    mobileControlState={mobileControlState}
                  />
                </KeyboardControls>
              )}
            </Suspense>
          </Canvas>

          {isMobile && (
            <MobileControlButtons
              setMobileControlState={setMobileControlState}
            />
          )}

          {/* INFO CONTAINERS */}
          <Info
            player={player}
            contract={contract}
            updateNum={updateNum}
            seeds={seeds}
            items={items}
            farmCoinAssetID={farmCoinAssetID}
          />

          {player !== null && (
            <>
              {/* GAME MODALS */}
              {modal === "plant" && (
                <PlantModal
                  contract={contract}
                  updatePageNum={updatePageNum}
                  tileArray={tileArray}
                  seeds={seeds}
                  setCanMove={setCanMove}
                  setModal={setModal}
                  onPlantSuccess={handlePlantSuccess}
                />
              )}
              {modal === "harvest" && (
                <HarvestModal
                  contract={contract}
                  tileArray={tileArray}
                  updatePageNum={updatePageNum}
                  setCanMove={setCanMove}
                  setModal={setModal}
                  onHarvestSuccess={onHarvestSuccess}
                />
              )}

              {modal === "market" && (
                <MarketModal
                  contract={contract}
                  updatePageNum={updatePageNum}
                  items={items}
                  setCanMove={setCanMove}
                  farmCoinAssetID={farmCoinAssetID}
                />
              )}
            </>
          )}

          {/* NEW PLAYER MODAL */}
          {player === null && (
            <NewPlayer
              updatePageNum={updatePageNum}
              setPlayer={setPlayer}
              setModal={setModal}
            />
          )}
        </>
      )}
    </Box>
  );
}

const styles = {
  canvasContainer: cssObj({
    border: "4px solid #754a1e",
    borderRadius: "8px",
    height: " calc(100vh - 8px)",
    width: "1000px",
    margin: "auto",
    "@sm": {
      maxHeight: "740px",
    },
  }),
};
