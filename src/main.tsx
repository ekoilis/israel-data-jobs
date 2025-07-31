import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CSVStorageService } from './services/JobCollectionService'

// Initialize clean storage at application startup
CSVStorageService.initializeCleanStorage();

createRoot(document.getElementById("root")!).render(<App />);
