import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { ThemeProvider } from "@gravity-ui/uikit";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<App />
		</ThemeProvider>
	</StrictMode>
);
