  import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

console.log("Starting React application...");

try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  console.log("Root element found, rendering App...");
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log("App rendered successfully!");
} catch (error) {
  console.error("Error rendering React app:", error);
}
