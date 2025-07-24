import { useState, useEffect } from "react";
import { supabase } from "../api/client";
import "./Admin.css";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    location: "",
    date: "",
    time: "",
    amount: "",
    description: "",
    tickets: "",
    duration: "",
    image: "",
    terms: ""
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("event")
      .select("id, name, location, date, time, amount");
    if (!error) setEvents(data);
  };

  const openAddForm = () => {
    setFormData({
      id: null,
      name: "",
      location: "",
      date: "",
      time: "",
      amount: "",
      description: "",
      tickets: "",
      image: "",
      duration: "",
      terms: ""
    });
    setShowForm(true);
  };

  const openEditForm = async (event) => {
    try {
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .eq("id", event.id)
        .single();

      if (error) throw error;
      
      setFormData({
        id: data.id,
        name: data.name || "",
        location: data.location || "",
        date: data.date || "",
        time: data.time || "",
        amount: data.amount || 0,
        description: data.description || "",
        tickets: data.tickets || 0,
        duration: data.duration || 0,
        image: data.image || "",
        terms: data.terms || ""
      });
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching event details:", error);
      alert("Failed to load event details: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["amount", "tickets", "duration"].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");

      setUploadingImage(false);
      return data.secure_url;
    } catch (error) {
      setUploadingImage(false);
      alert("Image upload failed: " + error.message);
      return null;
    }
  };

  // Handle file input change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedUrl = await uploadImageToCloudinary(file);
    if (uploadedUrl) {
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, ...rest } = formData;
    let res;
    if (id) {
      res = await supabase.from("event").update(rest).eq("id", id);
    } else {
      res = await supabase.from("event").insert([rest]);
    }

    if (!res.error) {
      setShowForm(false);
      fetchEvents();
    } else {
      alert("Error: " + res.error.message);
    }
  };

  const handleDeleteRequest = (id) => {
    setDeleteConfirm({ show: true, id });
  };
  const confirmDelete = async () => {
    const { id } = deleteConfirm;
    const { error } = await supabase.from("event").delete().eq("id", id);
    if (!error) {
      fetchEvents();
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
      <h3 className="table-title">All Events</h3>
      <button className="add-btn" onClick={openAddForm}>+ Add Event</button>

      <div className="table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Amount</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.name}</td>
                <td>{event.location}</td>
                <td>{event.date}</td>
                <td>{event.time}</td>
                <td>₹{event.amount}</td>
                <td>
                  <button className="edit-btn" onClick={() => openEditForm(event)}>Edit</button>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteRequest(event.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{formData.id ? "Edit Event" : "Add Event"}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Event Name" required />
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount" required />

              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="3" />
              <input type="number" name="tickets" value={formData.tickets} onChange={handleChange} placeholder="Number of Tickets" />
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="Duration (hrs)" />

              {/* File input for image upload */}
              <div>
                <label>
                  Upload Image:
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
                {uploadingImage && <p>Uploading image...</p>}
                {formData.image && !uploadingImage && (
                  <img src={formData.image} alt="Event" style={{ maxWidth: "150px", marginTop: "10px" }} />
                )}
              </div>

              <textarea name="terms" value={formData.terms} onChange={handleChange} placeholder="Terms & Conditions" rows="3" />

              <div className="form-buttons">
                <button type="submit" className="save-btn" disabled={uploadingImage}>
                  {uploadingImage ? "Please wait..." : "Save"}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)} disabled={uploadingImage}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this event?</p>
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

export default Events;
