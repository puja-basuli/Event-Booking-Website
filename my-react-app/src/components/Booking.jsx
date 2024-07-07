import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "./api/client";
import axios from 'axios';
import './BookingPage.css';
import { useParams } from "react-router-dom";

function BookingPage() {
  const location = useLocation();
  const { event } = location.state;
  const [seatBook, setSeatBook] = useState(0);
  const [attendees, setAttendees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(event.date);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState();
  const [success, setSuccess] = useState(null);
  const [tickets, setTickets] = useState([]);

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

  const increaseSeat = () => {
    if (seatBook < event.seats) {
      setSeatBook(seatBook + 1);
      setAttendees([...attendees, { name: "" }]);
    }
  };

  const decreaseSeat = () => {
    if (seatBook > 0) {
      setSeatBook(seatBook - 1);
      setAttendees(attendees.slice(0, -1));
    }
  };

  const handleAttendeeChange = (index, value) => {
    const newAttendees = [...attendees];
    newAttendees[index].name = value;
    setAttendees(newAttendees);
  };

  const generateTicketNo = () => {
    return `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    const newTickets = attendees.map(() => generateTicketNo());

    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('seats')
        .eq('id', event.id)
        .single();

      if (eventError) {
        throw eventError;
      }

      if (eventData.seats < seatBook) {
        throw new Error("Not enough seats available.");
      }

      const { data, error } = await supabase
        .from('booking')
        .insert(attendees.map((attendee, index) => ({
          name: event.name,
          date: selectedDate,
          location: event.location,
          ticketno: newTickets[index],
          seatno: seatBook,
          attendee: attendee.name,
          email: userInfo.email,
        })));

      if (error) {
        throw error;
      }

      await supabase
        .from('events')
        .update({ seats: eventData.seats - seatBook })
        .eq('id', event.id);


        await axios.post('http://localhost:4000/', {
          params:{
          ticketNo: newTickets,
          userEmail: userInfo.email,}
        }).then(()=>{
          console.log("success email");
        }).catch(()=>{
          console.log("failed email");
        });
      setSuccess("Booking successful!");
      setSeatBook(0);
      setAttendees([]);
      setTickets(newTickets);
    } catch (error) {
      setError("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="dash"></div>
      <div className="booking-page">
        <div className="opac">
          <div>
            <h1>{event.name}</h1>
          </div>
          <div className="main">
            <div>
              <img src={event.img} alt={event.name} />
            </div>
            <div className="mid-book">
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Dates available:</strong> {event.date} - {event.dateto}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Price per person:</strong> {event.price}</p>
              <p><strong>Seats Available:</strong> {event.seats}</p>
              <p><strong>Description:</strong> {event.description}</p>
              <p>
                <strong>Select Date:</strong>
                <input
                  type="date"
                  value={selectedDate}
                  min={event.date}
                  max={event.dateto}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </p>
            </div>
          </div>
          <div className="flex">
            <button onClick={decreaseSeat} disabled={seatBook === 0}><i className="fa fa-minus" aria-hidden="true"></i></button>
            <p>{seatBook ? seatBook : "Add seats"}</p>
            <button onClick={increaseSeat} disabled={seatBook >= event.seats}><i className="fa fa-plus" aria-hidden="true"></i></button>
          </div>
          <div className="att">
            {Array.from({ length: seatBook }, (_, index) => (
              <div key={index} className="in">
                <input
                  type="text"
                  id={`add-attendee-${index}`}
                  value={attendees[index]?.name || ""}
                  onChange={(e) => handleAttendeeChange(index, e.target.value)}
                  required
                />
                <label htmlFor={`add-attendee-${index}`}>Add Attendee {index + 1}</label>
              </div>
            ))}
          </div>
          <button className="book" onClick={handleBooking} disabled={isSubmitting || seatBook === 0}>
            {isSubmitting ? "Booking..." : "Book Now"}
          </button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          {tickets.length > 0 && (
            <div className="tickets">
              <h2>Your Tickets:</h2>
              {tickets.map((ticket, index) => (
                <p key={index} className="ticket">Ticket No: {ticket}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
