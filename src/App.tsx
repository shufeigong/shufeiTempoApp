import { type FC, type ReactElement } from "react";
import { BoardComponent } from "./components/board.component";
import "./App.css";

const App: FC = (): ReactElement => {
  return <BoardComponent />;
};

export default App;
