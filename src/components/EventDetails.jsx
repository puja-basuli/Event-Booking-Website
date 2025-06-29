import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./api/client";
import './Booking/BookingPage.css';

function EventDetails() {
  const location = useLocation();
  const { event } = location.state;
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        if (data?.user) {
          setUserInfo(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }
    getUserData();
  }, []);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('booking')
        .delete()
        .eq('id', event.id);
      if (error) {
        throw error;
      }
      navigate('/dashboard'); 
    } catch (error) {
      setError("Error deleting event");
      console.error("Error deleting event:", error.message);
    }
  };

  const eventName = typeof event.name === 'object' ? JSON.stringify(event.name) : event.name;

  return (
    <div>
      <div className="dash"></div>
      <div className="booking-page">
        <div className="opac">
          <div>
            <h1>{eventName}</h1>
          </div>
          <div className="main">
            <div className="mid-book">
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Date:</strong> {event.date} - {event.dateto}</p>
              <p><strong>Attendee:</strong> {event.attendee}</p>
              <p><strong>Ticket No:</strong> {event.ticketno}</p>
              <p><strong>Seat No:</strong> {event.seats}</p>
              <button className="out" onClick={handleDelete}>
                Delete Event
              </button>
              {error && <p className="error-message">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
