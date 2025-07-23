import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/client";
import { toast } from "react-hot-toast";
import "./EventCard.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    year: "numeric"
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  const time = new Date(`2000-01-01T${timeString}`);
  return time.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });
};

const EventCard = ({ event, onWishlistChange }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleExplore = () => {
    navigate(`/booking/${event.id}`, { state: { event } });
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to add to wishlist");
        navigate("/signin");
        return;
      }

      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("event_id", event.id)
          .eq("user_email", user.email);

        if (error) throw error;
        
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from("wishlist")
          .insert({
            event_id: event.id,
            user_email: user.email,
            event_name: event.name,
            event_date: event.date,
            event_location: event.location,
            event_image: event.image,
            event_amount: event.amount
          });

        if (error) throw error;
        
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }

      if (onWishlistChange) {
        onWishlistChange();
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-card" onClick={handleExplore}>
      <div className="card-image-container">
        <img 
          src={event.image || "https://via.placeholder.com/320x200?text=Event+Image"} 
          alt={event.name} 
          className="card-image"
          loading="lazy"
        />
        {event.category && (
          <div className="card-badge">{event.category}</div>
        )}
      </div>
      
      <div className="card-content">
        <h3>{event.name}</h3>
        
        <div className="card-meta">
          <div className="card-meta-item">
            <i className="fa fa-calendar" aria-hidden="true"></i>
            <span>{formatDate(event.date)}</span>
          </div>
          
          {event.time && (
            <div className="card-meta-item">
              <i className="fa fa-clock-o" aria-hidden="true"></i>
              <span>{formatTime(event.time)}</span>
            </div>
          )}
          
          <div className="card-meta-item">
            <i className="fa fa-map-marker" aria-hidden="true"></i>
            <span>{event.location}</span>
          </div>
        </div>

        {event.amount && (
          <div className="card-price">₹{event.amount}</div>
        )}
        
        <div className="card-buttons">
          <button className="buy-btn" onClick={handleExplore}>
            Explore Event
          </button>
          <button 
            className={`heart-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            disabled={isLoading}
          >
            <i className={`fa ${isWishlisted ? 'fa-heart' : 'fa-heart-o'}`} aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;