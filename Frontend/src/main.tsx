import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('Main.tsx loading...');
console.log('Root element:', document.getElementById("root"));

try {
  const root = createRoot(document.getElementById("root")!);
  console.log('Root created successfully');
  root.render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error in main.tsx:', error);
}
