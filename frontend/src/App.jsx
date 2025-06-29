import "./App.css";
import Login from "./components/Auth/Login";
import {Route, Routes} from "react-router-dom";
import Layout from "./Layout";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Firstpage from "./components/Firstpage";
import Admin from "./components/Admin/Admin";
import BookingPage from "./components/Booking/Booking";

import Wishlist from "./components/Wishlist/Wishlist";
import EventDetails from "./components/EventDetails";
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Routes>
      
      <Route path="/" element={<Layout/>}> 

      <Route path="/signin" index element ={<Login/>}/>
      <Route index element ={<Firstpage/>}/>
      <Route path="/signup" index element ={<Register/>}/>
      <Route path="/dashboard" index element ={<Dashboard/>}/>
       <Route path="/admin" index element={<Admin />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/event/:id" element={<EventDetails />} />
     
      <Route path="/booking" index element ={<BookingPage/>}/>

      <Route path="/wishlist" index element ={<Wishlist/>}/>


      </Route>

    </Routes>
    </>
  );
}

export default App;
