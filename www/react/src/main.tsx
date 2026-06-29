import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// BrowserRouter must wrap App so that useNavigate / Link / Routes work anywhere in the tree.
// On the server (Nginx) we use try_files $uri /index.html so that direct URL visits
// (e.g. /calculator) still serve index.html and React Router picks up the path.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
