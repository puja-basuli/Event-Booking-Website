import { useState, useEffect } from "react";
import { supabase } from "../api/client";
import "./Admin.css";

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchCountsAndBookings = async () => {
      try {
        // Count queries
        const [{ count: usersCount }, { count: bookingsCount }, { count: eventsCount }] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("booking").select("*", { count: "exact", head: true }),
          supabase.from("event").select("*", { count: "exact", head: true })
        ]);
        setUserCount(usersCount || 0);
        setBookingCount(bookingsCount || 0);
        setEventCount(eventsCount || 0);

        // Booking table with join data
        const { data: bookingData, error } = await supabase
          .from("booking")
          .select(`
            id,
            amount,
            users ( name ),
            event ( name )
          `);

        if (error) throw error;
        setBookings(bookingData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      }
    };

    fetchCountsAndBookings();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="header-dash"></div>
      <h2 className="dashboard-title">Dashboard Overview</h2>

      <div className="dashboard-boxes">
        <div className="dashboard-box">
          <h3>Users</h3>
          <p>{userCount}</p>
        </div>
        <div className="dashboard-box">
          <h3>Bookings</h3>
          <p>{bookingCount}</p>
        </div>
        <div className="dashboard-box">
          <h3>Events</h3>
          <p>{eventCount}</p>
        </div>
      </div>

      <h3 className="table-title">All Bookings</h3>
      <div className="table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Name</th>
              <th>Event Name</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.users?.name || "Unknown"}</td>
                <td>{booking.events?.title || "Unknown"}</td>
                <td>₹{booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
