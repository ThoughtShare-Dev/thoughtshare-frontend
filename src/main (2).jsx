import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/global.css";

/**
 * Mock mode: when VITE_USE_MOCKS=true, MSW intercepts every API call in
 * the browser and answers with the fixtures in src/mocks/, seeded from
 * THOUGHTSHARE_MOCK_DATA.md. This lets the whole team build and demo
 * without depending on the real backend being up. Flip it to false in
 * .env once you want to hit the real backend.
 */
async function prepare() {
  if (import.meta.env.VITE_USE_MOCKS !== "true") return;
  const { worker } = await import("./mocks/browser.js");
  return worker.start({
    onUnhandledRequest: "bypass", // let anything we haven't mocked yet fall through
  });
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});
