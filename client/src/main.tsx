import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add BoxIcons CSS for icons used in the design
const boxiconsLink = document.createElement("link");
boxiconsLink.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
boxiconsLink.rel = "stylesheet";
document.head.appendChild(boxiconsLink);

// Add Google Fonts (Inter and Poppins) for typography used in the design
const googleFontsLink = document.createElement("link");
googleFontsLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap";
googleFontsLink.rel = "stylesheet";
document.head.appendChild(googleFontsLink);

// Add meta title
const metaTitle = document.createElement("title");
metaTitle.textContent = "Primeira Venda Online - Aprenda a vender online";
document.head.appendChild(metaTitle);

createRoot(document.getElementById("root")!).render(<App />);
