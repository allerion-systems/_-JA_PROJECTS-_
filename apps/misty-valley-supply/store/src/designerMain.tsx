/* Entry for the embeddable Design Center micro-app (designer.html).
   The full store chrome stays out; this is the design window alone, meant
   to be embedded in a chat surface (Claude artifact iframe, ChatGPT Apps
   SDK component) or any host page. State in, events out:
     in:  #d=<encoded design>  or  ?tool=<shed|deck|...>
     out: postMessage to parent — {type:"mvs-design", event, payload} on
          quote requests and sign-in asks, so the host chat can act. */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./auth";
import DesignerApp from "./DesignerApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <DesignerApp />
    </AuthProvider>
  </React.StrictMode>,
);
