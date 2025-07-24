import "./App.css";
import Login from "./components/Auth/Login";
import {Route, Routes} from "react-router-dom";
import Layout from "./Layout";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Hero from "./components/Hero/Hero";
import Admin from "./components/Admin/Admin";
<<<<<<< HEAD
import Selection from "./components/Booking/Selection";
=======
>>>>>>> c66a3d2 (fix: booking, ui)
import Wishlist from "./components/Wishlist/Wishlist";
import { Toaster } from 'react-hot-toast';
import Info from "./components/Booking/Info";


function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Routes>
      
      <Route path="/" element={<Layout/>}> 

      <Route path="/signin" index element ={<Login/>}/>
      <Route index element ={<Hero/>}/>
      <Route path="/signup" index element ={<Register/>}/>
      <Route path="/dashboard" index element ={<Dashboard/>}/>
       <Route path="/admin" index element={<Admin />} />
      <Route path="/admin/*" element={<Admin />} />
     
      <Route path="/booking/:id" index element ={<Info/>}/>

<<<<<<< HEAD
      <Route path="/selection/:id" index element ={<Selection/>}/>

=======
>>>>>>> c66a3d2 (fix: booking, ui)
      <Route path="/wishlist" index element ={<Wishlist/>}/>


      </Route>

    </Routes>
    </>
  );
}

export default App;
