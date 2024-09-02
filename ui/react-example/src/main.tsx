import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { __my_react_shared__ } from "@my-react/react";

__my_react_shared__.enableLoopFromRoot.current = true;

import App from "./App.tsx";
import "@git-diff-view/react/styles/diff-view.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
