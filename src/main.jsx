import "@/components/keenicons/assets/styles.css";
import "./styles/globals.css";
import axios from "axios";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { setupAxios } from "./auth";
import { ProvidersWrapper } from "./providers";
import { applyDomainTheme } from "./config/applyDomainTheme";
// import React from "react";

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios);

applyDomainTheme();
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ProvidersWrapper>
    <App />
  </ProvidersWrapper>
);
// need to uncomment when production
// root.render(<React.StrictMode>
//     <ProvidersWrapper>
//       <App />
//     </ProvidersWrapper>
//   </React.StrictMode>);
