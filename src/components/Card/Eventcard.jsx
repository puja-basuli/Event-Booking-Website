
import React from "react";
import "./EventCard.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const EventCard = ({ event }) => {
  return (
    <div className="modern-card">
      <img src={event.image} alt={event.name} className="card-image" />
      <div className="card-content">
        <h3>{event.name}</h3>
        <p className="card-subtext">{formatDate(event.date)}, {event.location}</p>
        <div className="card-buttons">
          <button className="buy-btn">Buy now</button>
          <button className="heart-btn">
            <i className="fa fa-heart-o" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
