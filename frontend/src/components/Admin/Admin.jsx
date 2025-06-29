import { Link, Routes, Route, Navigate } from "react-router-dom";
import Payments from "./Payments.jsx";
import Users from "./Users.jsx";
import Events from "./Events.jsx";
import Bookings from "./Bookings.jsx";
import Dashboard from "./Dashboard.jsx";
import "./Admin.css";

const Admin = () => {
  return (
    <div className="admin-container">
      <div className="sidebar">
        <div className="header-dash"></div>
        <Link to="/admin/dashboard" className="bar-content">Dashboard</Link>
        <Link to="/admin/users" className="bar-content">Users</Link>
        <Link to="/admin/events" className="bar-content">Events</Link>
        <Link to="/admin/bookings" className="bar-content">Bookings</Link>
        <Link to="/admin/payments" className="bar-content">Payments</Link>
      </div>

      <div className="admin-main">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/events" element={<Events />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
