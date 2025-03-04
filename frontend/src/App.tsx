import { cssObj } from "@fuel-ui/css";
import { Box, BoxCentered, Heading } from "@fuel-ui/react";
//Add Analytics
import { useEffect, useMemo, useState } from "react";

import "./App.css";
import { FarmContract } from "./api/farmContract.tsx";
import { useWallet } from "./api/useWallet.tsx";
import Game from "./components/Game.tsx";
import Home from "./components/home/Home.tsx";
import { useIsConnected } from "./api/useIsConnected.tsx";

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /(iphone|android|windows phone)/.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const contract = useMemo(() => {
    if (wallet) {
      const contract = new FarmContract("SMOKE WEED EVERY DAY 💚💛", wallet);
      return contract;
    }
    return null;
  }, [wallet]);

  return (
    <Box css={styles.root}>
      {isConnected && contract ? (
        <Game
          contract={contract}
          isMobile={isMobile}
          farmCoinAssetID={"$SMOKEN"}
        />
      ) : (
        <BoxCentered css={styles.box}>
          <BoxCentered css={styles.innerBox}>
            <Heading css={styles.heading} as={"h1"}>
              GANJA FARM
            </Heading>
            <Home isMobile={isMobile} wallet={wallet ?? "not connected"} />
          </BoxCentered>
        </BoxCentered>
      )}
    </Box>
  );
}

export default App;

const styles = {
  root: cssObj({
    textAlign: "center",
    height: "100vh",
    width: "100vw",
    "@sm": {
      display: "grid",
      placeItems: "center",
    },
  }),
  box: cssObj({
    marginTop: "10%",
  }),
  innerBox: cssObj({
    display: "block",
  }),
  heading: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$5xl",
    marginBottom: "40px",
    lineHeight: "3.5rem",
    color: "green",
    "@sm": {
      fontSize: "$7xl",
      lineHeight: "2.5rem",
    },
  }),
  button: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$sm",
    margin: "auto",
    backgroundColor: "transparent",
    color: "#aaa",
    border: "2px solid #754a1e",
    "&:hover": {
      color: "#ddd",
      background: "#754a1e !important",
      border: "2px solid #754a1e !important",
      boxShadow: "none !important",
    },
  }),
  download: cssObj({
    color: "#ddd",
    fontFamily: "pressStart2P",
    lineHeight: "24px",
  }),
  smallScreen: cssObj({
    color: "#ddd",
    fontFamily: "pressStart2P",
    fontSize: "12px",
    "@sm": {
      display: "none",
    },
  }),
};
