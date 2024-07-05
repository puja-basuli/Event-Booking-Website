import React from 'react'
import Navbar from './components/Navbar'
import Firstpage from './components/Firstpage'
import { Outlet } from 'react-router-dom'
const Layout = () => {
  return (
    <div>
      <Navbar/>
      
      <Outlet/>
    </div>
  )
}

export default Layout
