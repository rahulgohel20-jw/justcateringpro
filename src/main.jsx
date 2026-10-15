import "@/components/keenicons/assets/styles.css";
import "./styles/globals.css";
import axios from "axios";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { setupAxios } from "./auth";
import { ProvidersWrapper } from "./providers";
import { applyDomainTheme } from "./config/applyDomainTheme";
import { ThemeSync } from "./ThemeSync";

setupAxios(axios);

applyDomainTheme(); // first paint only (hostname / default theme)

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ProvidersWrapper>
    <ThemeSync />
    <App />
  </ProvidersWrapper>
);