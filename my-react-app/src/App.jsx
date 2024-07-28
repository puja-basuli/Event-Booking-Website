import "./App.css";
import React from "react";
import Login from "./components/Auth/Login";
import {Route, Routes} from "react-router-dom";
import Layout from "./Layout";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard";
import Firstpage from "./components/Firstpage";
import Admin from "./components/Admin/Admin";
import BookingPage from "./components/Booking";
import Add from "./components/Admin/Add";
import CompleteProfile from "./components/Auth/Completeprofile";
import Edit from "./components/Admin/Edit";
import Wishlist from "./components/Wishlist";
import EventDetails from "./components/EventDetails";

import StripePayment from "./components/StripePayment";

import PaymentSuccess from "./components/PaymentSuccess";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout/>}> 

      <Route path="/login" index element ={<Login/>}/>
      <Route index element ={<Firstpage/>}/>
      <Route path="/register" index element ={<Register/>}/>
      <Route path="/dashboard" index element ={<Dashboard/>}/>
      <Route path="/admin" index element ={<Admin/>}/>
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/admin/add" index element ={<Add/>}/>

      <Route path="/admin/edit" index element ={<Edit/>}/>
      <Route path="/booking" index element ={<BookingPage/>}/>

      <Route path="/wishlist" index element ={<Wishlist/>}/>

      <Route path="payment" element={<StripePayment />} />
      <Route path="success" element={<PaymentSuccess />} />
      <Route path="/complete-profile" index element ={<CompleteProfile/>}/>
      </Route>

    </Routes>
    
  );
}

export default App;
