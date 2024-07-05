import React, { useState } from "react";
import { Link } from "react-router-dom";

function EventCard({ event }) {
  const [showDescription, setShowDescription] = useState(false);

  const toggleDescription = () => {
    setShowDescription((prevState) => !prevState);
  };

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
      <button className="out" onClick={toggleDescription}>
        {showDescription ? "Show Less" : "Know More"}
      </button>
    </div>
  );
}

export default EventCard;
