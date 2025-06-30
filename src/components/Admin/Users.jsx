import { useState, useEffect } from "react";
import { supabase } from "../api/client";
import "./Admin.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [activeUserBookings, setActiveUserBookings] = useState({}); // key: userId, value: booking[]
  const [openRow, setOpenRow] = useState(null); // which user's bookings are shown

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, picture, admin");

    if (error) {
      console.error("Error fetching users:", error.message);
    } else {
      setUsers(data);
    }
  };

  const toggleBookings = async (userId) => {
    if (openRow === userId) {
      setOpenRow(null); // close if already open
      return;
    }

    // If not already fetched, fetch and cache
    if (!activeUserBookings[userId]) {
      const { data, error } = await supabase
        .from("booking")
        .select("id, amount, event(name)")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching bookings:", error.message);
        return;
      }

      setActiveUserBookings(prev => ({ ...prev, [userId]: data }));
    }

    setOpenRow(userId); // open selected user
  };

  return (
    <div>
      <div className="header-dash"></div>
      <h3 className="table-title">All Users</h3>
      <div className="table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Picture</th>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Bookings</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <>
                <tr key={user.id}>
                  <td>
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                      />
                    ) : "No Image"}
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.admin === "yes" ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => toggleBookings(user.id)} className="edit-btn">
                      {openRow === user.id ? "Hide" : "Bookings"}
                    </button>
                  </td>
                </tr>

                {/* Bookings row */}
                {openRow === user.id && (
                  <tr className="booking-row">
                    <td colSpan="5">
                      {activeUserBookings[user.id]?.length ? (
                        <table className="nested-booking-table">
                          <thead>
                            <tr>
                              <th>Booking ID</th>
                              <th>Event Name</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeUserBookings[user.id].map(booking => (
                              <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.event?.name || "Unknown"}</td>
                                <td>₹{booking.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No bookings found.</p>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
