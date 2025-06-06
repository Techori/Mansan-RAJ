
/**
 * Application Entry Point
 * Initializes the React application by rendering the root App component
 * into the DOM.
 */

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
