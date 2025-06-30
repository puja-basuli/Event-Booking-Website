import React from 'react'
import Navbar from './components/miscelleous/Navbar'
import Hero from './components/Hero/Hero'
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
