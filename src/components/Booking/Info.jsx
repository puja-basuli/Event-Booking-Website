import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../api/client";
import "./Booking.css";
import Footer from "../miscelleous/Footer";
const defaultImage = "https://via.placeholder.com/500x300?text=No+Image";

const Info = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(location.state?.event || null);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!event && id) {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          setError("Event not found.");
        } else {
          setEvent(data);
        }
      }
    }
    fetchEvent();
  }, [event, id]);

  if (error) return <p className="error">{error}</p>;
  if (!event) return <p className="loading">Loading event...</p>;

  // Short description for "Show more" toggle
  const shortDesc = event.description?.slice(0, 150) + (event.description.length > 150 ? "..." : "");

  return (
    <div className="dashboard">
    <main className="booking-page">
        <div className="header-dash-2"></div>
      <div className="event-wrapper">
        {/* Left big image with decorative overlay */}
        <div className="event-image-container">
          <img
            src={event.image || defaultImage}
            alt={event.name}
            className="event-main-image"
            loading="lazy"
            onError={(e) => (e.target.src = defaultImage)}
          />
          {/* Decorative musical notes or flowers can be added via CSS */}
        </div>

        {/* Right summary card */}
        <div className="event-summary-card">
          <h2 className="event-title">{event.name}</h2>

          <div className="event-meta">
            <div>
              <i className="fa fa-bookmark" aria-hidden="true"></i>
              <span>{event.category || "Music"}</span>
            </div>
            <div>
              <i className="fa fa-calendar-o" aria-hidden="true"></i>
              <span>{new Date(event.date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div>
              <i className="fa fa-map-marker" aria-hidden="true"></i>
              <span>{event.location}</span>
            </div>
          </div>

          <div className="event-price">₹{event.amount}</div>

          <button
            className="book-button"
            onClick={() => navigate(`/selection/${event.id}`, { state: { event } })}
          >
            BOOK TICKETS
          </button>
        </div>
      </div>

      {/* Below: About Event */}
      <section className="about-event">
        <h3>About the Event</h3>
        <p>
          {showMore ? event.description : shortDesc}
          {event.description.length > 150 && (
            <button className="show-more-btn" onClick={() => setShowMore(!showMore)}>
              {showMore ? "Show less" : "Show more"}
            </button>
          )}
        </p>
      </section>

      {/* Event Guide */}
      <section className="event-guide">
        <h3>Event Guide</h3>
        <div className="guide-items">
          <div>
            <i className="fa fa-language" aria-hidden="true"></i>
            <div>
              <strong>Language</strong>
              <p>{event.language || "English, Hindi, Hinglish"}</p>
            </div>
          </div>
          <div>
            <i className="fa fa-clock-o" aria-hidden="true"></i>
            <div>
              <strong>Duration</strong>
              <p>{event.duration || "3 Hours"}</p>
            </div>
          </div>
          <div>
            <i className="fa fa-ticket" aria-hidden="true"></i>
            <div>
              <strong>Tickets Needed For</strong>
              <p>{event.agelimit || "18 yrs & above"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="gallery-section">
        <h3>Gallery</h3>
        <div className="gallery-images">
          {[event.image, event.image, event.image].map((img, i) => (
            <img
              key={i}
              src={img || defaultImage}
              alt={`${event.name} gallery ${i + 1}`}
              className="gallery-image"
              loading="lazy"
              onError={(e) => (e.target.src = defaultImage)}
            />
          ))}
        </div>

        {/* Venue */}
        <section>
            <h3>Venue</h3>
             <div className="venue-info">
         
          <span>{event.location}</span>
        </div>
        </section>
       
      </section>
    
    </main>
      <Footer/>
    </div>
  );
};

export default Info;
