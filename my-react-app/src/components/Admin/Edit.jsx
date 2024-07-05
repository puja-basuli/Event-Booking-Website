import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../api/client";
import "./Admin.css";

const Edit = () => {
  const location = useLocation();
  const { event } = location.state;
  const navigate = useNavigate();

  const [name, setName] = useState(event.name);
  const [category, setCategory] = useState(event.category);
  const [eventLocation, setEventLocation] = useState(event.location);
  const [dateto, setDateto] = useState(event.dateto);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [price, setPrice] = useState(event.price);
  const [seats, setSeats] = useState(event.seats);
  const [description, setDescription] = useState(event.description);
  const [isEditing, setIsEditing] = useState(false);
const [img,setImg]=useState(event.img);
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const updateEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .update({
          name,
          date,
          dateto,
          location: eventLocation,
          description,
          time,
          price,
          seats,
          img,
          category,
          
        })
        .eq("id", event.id);
      if (error) {
        throw error;
      }
      setIsEditing(false);
      console.log("Event updated successfully:", data);
      alert("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error.message);
      alert("Error updating event: " + error.message);
    }
  };

  const cancelEvent = async (eventId) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
      console.log("Event canceled successfully:", data);
      alert("Event canceled successfully");
      navigate("/admin");
    } catch (error) {
      console.error("Error canceling event:", error.message);
      alert("Error canceling event: " + error.message);
    }
  };

  const handleSave = () => {
    updateEvent();
  };

  return (
    <div>
      <div className="dash"></div>
      <div className="edit">
        <div className="img">
          <Link to="/admin">
            <button className="out">GO BACK</button>
          </Link>
         

          {isEditing ? (
            <div>
            <img src={img} alt={name} />
              <input
                type="text"
                value={img}
                className="edit-input"
                onChange={(e) => setImg(e.target.value)}
                
              />
               </div>
            ) : (
                <img src={img} alt={name} />
            )}
        </div>
        <div>
          <h1>Name:
            {isEditing ? (
              <input
                type="text"
                value={name}
                className="edit-input"
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              name
            )}
          </h1>

          <p>
            <strong>Category</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                className="edit-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            ) : (
              category
            )}
          </p>
          <p>
            <strong>Location:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                className="edit-input"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            ) : (
              eventLocation
            )}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                className="edit-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            ) : (
              date
            )}
          </p>
          <p>
            <strong>Date upto:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                className="edit-input"
                value={dateto}
                onChange={(e) => setDateto(e.target.value)}
              />
            ) : (
              date
            )}
          </p>
          <p>
            <strong>Time:</strong>{" "}
            {isEditing ? (
              <input
                type="time"
                className="edit-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            ) : (
              time
            )}
          </p>
          <p>
            <strong>Price per person:</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                className="edit-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            ) : (
              price
            )}
          </p>
          <p>
            <strong>Seats Available:</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                className="edit-input"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
            ) : (
              seats
            )}
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {isEditing ? (
              <textarea
                className="edit-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            ) : (
              description
            )}
          </p>
        </div>
        <div className="actions">
          {isEditing ? (
            <button className="out" onClick={handleSave}>
              Save
            </button>
          ) : (
            <button className="out" onClick={toggleEditing}>
              EDIT
            </button>
          )}
          <button className="out" onClick={() => cancelEvent(event.id)}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
