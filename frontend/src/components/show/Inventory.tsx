import styled from "@emotion/styled";

interface InventoryProps {
  seeds: number;
  items: number;
}

const Container = styled.div`
  display: flex;
  border: 3px solid #754a1e;
  border-radius: 8px;
  height: 80px;
  width: 200px;
  box-sizing: border-box;
  align-items: center;
  background: #ac7339;
  justify-content: center;
  padding: 0 10px;
`;

const ItemBox = styled.div`
  width: 60px;
  position: relative;
  margin: 0 5px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 640px) {
    width: 80px;
  }
`;

const ItemImage = styled.img`
  image-rendering: pixelated;
  height: 50px;

  @media (min-width: 640px) {
    height: 70px;
  }
`;

const CounterWrapper = styled.div`
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const Counter = styled.div`
  font-size: 10px;
  font-family: pressStart2P;
  min-width: 25px;
  height: 25px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: grid;
  place-items: center;

  @media (min-width: 640px) {
    width: 35px;
    height: 35px;
  }
`;

export default function Inventory({ seeds, items}: InventoryProps) {
  return (
    <Container>
      <ItemBox>
        <ItemImage src="images/tomato_seed_bag.png" alt="Seeds" />
        <CounterWrapper>
          <Counter>
            {seeds != null && seeds > 99 ? "99+" : seeds ?? "-"}
          </Counter>
        </CounterWrapper>
      </ItemBox>

      <ItemBox>
        <ItemImage src="images/tomato.png" alt="Tomatoes" />
        <CounterWrapper>
          <Counter>{items > 99 ? "99+" : items}</Counter>
        </CounterWrapper>
      </ItemBox>
    </Container>
  );
}
