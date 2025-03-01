import { cssObj } from "@fuel-ui/css";
import { Button } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useWallet } from "../api/useWallet";
import type { Modals } from "../constants";

import { PlayerOutput } from "../api/farmContract";
import { buttonStyle } from "../constants";

import { BN } from "fuels";
import Loading from "./Loading";

interface NewPlayerProps {
  updatePageNum: () => void;
  setPlayer: Dispatch<SetStateAction<PlayerOutput | null>>;
  setModal: Dispatch<SetStateAction<Modals>>;
}

export default function NewPlayer({
  updatePageNum,
  setPlayer,
  setModal,
}: NewPlayerProps) {
  const [status, setStatus] = useState<"error" | "loading" | "none">("none");
  const [hasFunds, setHasFunds] = useState<boolean>(true);
  const { wallet } = useWallet();

  async function handleNewPlayer() {
    try {
      setStatus("loading");
      const response = await fetch('/api/new-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: wallet })
      });

      if (response.ok) {
        setPlayer({
          userId: wallet,
          farmingSkill: 1,
          totalValueSold: 0,
        } as PlayerOutput);
        setModal("none");
        updatePageNum();
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.log("Error in NewPlayer:", err);
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="new-player-modal">
        {status === "none" && hasFunds && (
          <Button css={buttonStyle} onPress={handleNewPlayer}>
            Make A New Player
          </Button>
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
        {status === "loading" && <Loading />}
      </div>
    </div>
  );
}

const styles = {
  container: cssObj({
    flexDirection: "column",
    fontFamily: "pressStart2P",
    fontSize: "14px",
    gap: "20px",
  }),
  link: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "14px",
  }),
};
