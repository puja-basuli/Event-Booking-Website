import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/miscelleous/Navbar.jsx'
import Firstpage from './components/Firstpage.jsx';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    
    
    <App />
    
    </BrowserRouter>
  </React.StrictMode>
)
