import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../api/client";

function EventCard({ event }) {
  const [showDescription, setShowDescription] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        setSaveError('Error fetching user data');
        console.error('Error fetching user data:', error.message);
      } finally {
        setLoadingUser(false);
      }
    }
    getUserData();
  }, []);

  const toggleDescription = () => {
    setShowDescription((prevState) => !prevState);
  };

  const saveToWishlist = async () => {
    if (!user) {
      setSaveError('You need to be logged in to save events to your wishlist.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ 
          event_id: event.id,
          email: user.email,
          name: event.name,
          location: event.location,
          date: event.date,
          time: event.time,
          price: event.price,
          seats: event.seats,
          img: event.img,
          description: event.description,
        }]);

      if (error) {
        throw error;
      }
      alert('Event saved to wishlist!');
    } catch (error) {
      setSaveError('Error saving event to wishlist. Please try again later.');
      console.error('Error saving event to wishlist:', error.message);
    }
  };

  if (loadingUser) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="event-card">
      <Link to="/booking" state={{ event }}>
        <img src={event.img} alt={event.name} />
        <div className="event-details">
          <h2>{event.name}</h2>
          <p>Location: {event.location}</p>
          <p>Date: {event.date}</p>
          <p>Time: {event.time}</p>
          <p>Price per person: {event.price}</p>
          <p>Seats Available: {event.seats}</p>
          <p>{showDescription ? event.description : `${event.description.slice(0, 100)}...`}</p>
        </div>
      </Link>
      <div>
        <button className="out" onClick={toggleDescription}>
          {showDescription ? "Show Less" : "Know More"}
        </button>
        <button className="outwhite" onClick={saveToWishlist}>
          <i className="fa fa-heart" aria-hidden="true"></i>
        </button>
      </div>
      {saveError && <p className="error">{saveError}</p>}
    </div>
  );
}

export default EventCard;
