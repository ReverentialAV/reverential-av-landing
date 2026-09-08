import React from "react";
import { createRoot } from "react-dom/client";
import Reverential from "./src.jsx";

const el = document.getElementById("root");
createRoot(el).render(React.createElement(Reverential));
