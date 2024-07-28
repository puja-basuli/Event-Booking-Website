import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "./api/client";
import axios from 'axios';
import './BookingPage.css';
import {loadStripe} from '@stripe/stripe-js';

function BookingPage() {
  const location = useLocation();
  const { event } = location.state;
  const [seatBook, setSeatBook] = useState(0);
  const [attendees, setAttendees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(event.date);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [paymentUrl, setPaymentUrl] = useState('');

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
        console.log(error);
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

  const calculateTotalAmount = () => {
    return seatBook * event.price;
  };

  const makePayment = async () => {
    const stripe = await loadStripe("pk_test_51PecWOLXUAx23PpQ6YXYa5npy9ga1geoAjnY0DX8d6WFZGOu4QYpCh7QFfOx54pMHXT7kPDLCqIALanGy2AiEQPW00ku1jt87p");

    const body = {
      products: attendees.map(attendee => ({
        name: event.name,
        quantity: 1,
        price: event.price,
      })),
    };

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch("http://localhost:7000/api/create-checkout-session", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const session = await response.json();

    const result = stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.log(result.error);
    }
  };

  const handleBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setTickets([]);

    const newTickets = attendees.map(() => generateTicketNo());

    try {
      // Fetch current event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('seats')
        .eq('id', event.id)
        .single();

      if (eventError) throw eventError;

      // Check if there are enough seats available
      if (eventData.seats < seatBook) {
        throw new Error("Not enough seats available.");
      }

      // Insert booking information
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

      setSuccess("Booking successful!");
      setSeatBook(0);
      setAttendees([]);
      setTickets(newTickets);

    } catch (error) {
      setError("Booking failed. Please try again.");
      console.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentAndBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setTickets([]);

    try {
      await makePayment();
      const paymentSuccess = true; 

      if (paymentSuccess) {
        await handleBooking();
      } else {
        throw new Error("Payment failed. Please try again.");
      }

    } catch (error) {
      setError("Error during booking or payment. Please try again.");
      console.error(error.message);
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
          <button onClick={handlePaymentAndBooking} className="out" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
