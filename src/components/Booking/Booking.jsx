import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../api/client";
import "./Booking.css";

function BookingPage() {
  const location = useLocation();
  const { event } = location.state;
  const [seatBook, setSeatBook] = useState(0);
  const [attendees, setAttendees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(event.date);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUserInfo(data.user);
      } catch (error) {
        console.log(error);
      }
    }
    getUserData();
  }, []);

  const increaseSeat = () => {
    if (seatBook < event.seats) {
      setSeatBook(prev => prev + 1);
      setAttendees([...attendees, { name: "" }]);
    }
  };

  const decreaseSeat = () => {
    if (seatBook > 0) {
      setSeatBook(prev => prev - 1);
      setAttendees(attendees.slice(0, -1));
    }
  };

  const handleAttendeeChange = (index, value) => {
    const updated = [...attendees];
    updated[index].name = value;
    setAttendees(updated);
  };

  const generateTicketNo = () => {
    return `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setTickets([]);

    const newTickets = attendees.map(() => generateTicketNo());

    try {
      const { data: eventData, error: fetchError } = await supabase
        .from("events")
        .select("seats")
        .eq("id", event.id)
        .single();

      if (fetchError) throw fetchError;
      if (eventData.seats < seatBook) throw new Error("Not enough seats available.");

      const { error: insertError } = await supabase
        .from("booking")
        .insert(
          attendees.map((attendee, index) => ({
            name: event.name,
            date: selectedDate,
            location: event.location,
            ticketno: newTickets[index],
            seatno: seatBook,
            attendee: attendee.name,
            email: userInfo.email,
          }))
        );

      if (insertError) throw insertError;

      await supabase
        .from("events")
        .update({ seats: eventData.seats - seatBook })
        .eq("id", event.id);

      setSuccess("Booking successful!");
      setTickets(newTickets);
      setAttendees([]);
      setSeatBook(0);
    } catch (error) {
      setError(error.message || "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <h1>{event.name}</h1>
        <div className="event-info">
          <img src={event.img} alt={event.name} />
          <div className="details">
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date:</strong> {event.date} - {event.dateto}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Price per seat:</strong> ₹{event.price}</p>
            <p><strong>Available seats:</strong> {event.seats}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <label>
              <strong>Select Date:</strong>
              <input
                type="date"
                value={selectedDate}
                min={event.date}
                max={event.dateto}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="seat-controls">
          <button onClick={decreaseSeat} disabled={seatBook === 0}>-</button>
          <span>{seatBook || "Add seats"}</span>
          <button onClick={increaseSeat} disabled={seatBook >= event.seats}>+</button>
        </div>

        <div className="attendee-inputs">
          {attendees.map((att, index) => (
            <div key={index}>
              <label>Attendee {index + 1}:</label>
              <input
                type="text"
                value={att.name}
                onChange={(e) => handleAttendeeChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {tickets.length > 0 && (
          <div className="tickets">
            <h2>Tickets:</h2>
            {tickets.map((ticket, index) => (
              <p key={index}>🎟️ {ticket}</p>
            ))}
          </div>
        )}

        <button className="book-btn" onClick={handleBooking} disabled={isSubmitting}>
          {isSubmitting ? "Booking..." : "Book Now"}
        </button>
      </div>
    </div>
  );
}

export default BookingPage;
