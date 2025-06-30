import { useState, useEffect } from "react";
import { supabase } from "../api/client";
import "./Admin.css";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    amount: "",
    seat_number: ""
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("booking")
      .select("id, amount, seat_number, users(name, email), event(name)")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error.message);
    } else {
      setBookings(data || []);
    }
  };

  const handleEdit = (booking) => {
    setEditing(booking.id);
    setFormData({
      id: booking.id,
      amount: booking.amount,
      seat_number: booking.seat_number || ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { id, ...rest } = formData;
    const { error } = await supabase.from("booking").update(rest).eq("id", id);

    if (!error) {
      setEditing(null);
      fetchBookings();
    } else {
      alert("Update error: " + error.message);
    }
  };

  const handleDeleteRequest = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    const { id } = deleteConfirm;
    const { error } = await supabase.from("booking").delete().eq("id", id);
    if (!error) {
      fetchBookings();
    } else {
      alert("Delete error: " + error.message);
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  return (
    <div>
      <div className="header-dash"></div>
      <h3 className="table-title">All Bookings</h3>
      <div className="table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User Email</th>
              <th>User Name</th>
              <th>Event Name</th>
              <th>Seat Number</th>
              <th>Amount</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) =>
              editing === booking.id ? (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.users?.email}</td>
                  <td>{booking.users?.name}</td>
                  <td>{booking.event?.name}</td>
                  <td>
                    <input
                      type="text"
                      name="seat_number"
                      value={formData.seat_number}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                  </td>
                  <td colSpan={2}>
                    <button className="save-btn" onClick={handleUpdate}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.users?.email}</td>
                  <td>{booking.users?.name}</td>
                  <td>{booking.event?.name}</td>
                  <td>{booking.seat_number || "N/A"}</td>
                  <td>₹{booking.amount}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(booking)}>Edit</button>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDeleteRequest(booking.id)}>Delete</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm.show && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this booking?</p>
            <div className="form-buttons">
              <button className="save-btn" onClick={confirmDelete}>Yes, Delete</button>
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
