import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { TheoremProvider } from "./providers/TheoremProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "lemma",
          url: window.location.href,
        },
        infuraAPIKey: "54bd2b3d04554418bc7b34ab11d2beef",
      }}
    >
      <TheoremProvider>
        <App />
      </TheoremProvider>
    </MetaMaskProvider>
    {/* <App /> */}
  </StrictMode>
);
