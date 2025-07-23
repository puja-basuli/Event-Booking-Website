import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../api/client";
import { toast } from "react-hot-toast";
import Footer from "../miscelleous/Footer";
import "./Booking.css";

const defaultImage = "https://via.placeholder.com/500x300?text=Event+Image";

const Info = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(location.state?.event || null);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(!event);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [bookingData, setBookingData] = useState({
    quantity: 1,
    name: "",
    email: "",
    phone: ""
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setBookingData(prev => ({
          ...prev,
          email: user.email,
          name: user.user_metadata?.full_name || ""
        }));
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!event && id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("event")
            .select("*")
            .eq("id", id)
            .single();
          
          if (error) throw error;
          setEvent(data);
        } catch (error) {
          console.error("Error fetching event:", error);
          setError("Event not found");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchEvent();
  }, [event, id]);

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, Math.min(10, bookingData.quantity + change));
    setBookingData(prev => ({ ...prev, quantity: newQuantity }));
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please sign in to book tickets");
      navigate("/signin");
      return;
    }

    if (!bookingData.name || !bookingData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsBooking(true);
    try {
      const totalAmount = event.amount * bookingData.quantity;
      
      const { data, error } = await supabase
        .from("booking")
        .insert({
          event_id: event.id,
          user_id: user.id,
          email: user.email,
          name: bookingData.name,
          phone: bookingData.phone,
          quantity: bookingData.quantity,
          amount: totalAmount,
          status: "confirmed"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Booking confirmed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book tickets. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
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

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="error-container">
            <h3>Event Not Found</h3>
            <p>{error || "The event you're looking for doesn't exist."}</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shortDesc = event.description?.slice(0, 200) + (event.description?.length > 200 ? "..." : "");
  const totalAmount = event.amount * bookingData.quantity;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book Your Tickets</h1>
          <p>Secure your spot at this amazing event</p>
        </div>

        <div className="event-details">
          <div className="event-main">
            <div className="event-image-container">
              <img
                src={event.image || defaultImage}
                alt={event.name}
                className="event-main-image"
                loading="lazy"
                onError={(e) => (e.target.src = defaultImage)}
              />
            </div>

            <div className="event-content">
              <h1 className="event-title">{event.name}</h1>

              <div className="event-meta">
                <div className="event-meta-item">
                  <i className="fa fa-calendar" aria-hidden="true"></i>
                  <span>{formatDate(event.date)}</span>
                </div>
                
                {event.time && (
                  <div className="event-meta-item">
                    <i className="fa fa-clock-o" aria-hidden="true"></i>
                    <span>{formatTime(event.time)}</span>
                  </div>
                )}
                
                <div className="event-meta-item">
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  <span>{event.location}</span>
                </div>
                
                {event.duration && (
                  <div className="event-meta-item">
                    <i className="fa fa-hourglass-half" aria-hidden="true"></i>
                    <span>{event.duration} hours</span>
                  </div>
                )}
              </div>

              {event.description && (
                <div className="event-description">
                  <h3>About the Event</h3>
                  <p>
                    {showMore ? event.description : shortDesc}
                    {event.description.length > 200 && (
                      <button 
                        className="show-more-btn" 
                        onClick={() => setShowMore(!showMore)}
                      >
                        {showMore ? "Show less" : "Show more"}
                      </button>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="booking-summary">
            <div className="summary-header">
              <h3>Book Tickets</h3>
              <div className="event-price">₹{event.amount}</div>
            </div>

            <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={bookingData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={bookingData.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  value={bookingData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Tickets</label>
                <div className="quantity-selector">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={bookingData.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{bookingData.quantity}</span>
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={bookingData.quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="booking-total">
                <div className="total-row">
                  <span>Ticket Price:</span>
                  <span>₹{event.amount}</span>
                </div>
                <div className="total-row">
                  <span>Quantity:</span>
                  <span>{bookingData.quantity}</span>
                </div>
                <div className="total-row">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <button
                type="button"
                className="book-now-btn"
                onClick={handleBooking}
                disabled={isBooking || !bookingData.name || !bookingData.phone}
              >
                {isBooking ? "Processing..." : `Book Now - ₹${totalAmount}`}
              </button>
            </form>
          </div>
        </div>

        {/* Event Guide */}
        <div className="event-guide">
          <h3>Event Information</h3>
          <div className="guide-grid">
            <div className="guide-item">
              <i className="fa fa-language" aria-hidden="true"></i>
              <div className="guide-content">
                <h4>Language</h4>
                <p>{event.language || "English, Hindi"}</p>
              </div>
            </div>
            <div className="guide-item">
              <i className="fa fa-clock-o" aria-hidden="true"></i>
              <div className="guide-content">
                <h4>Duration</h4>
                <p>{event.duration || "3"} Hours</p>
              </div>
            </div>
            <div className="guide-item">
              <i className="fa fa-users" aria-hidden="true"></i>
              <div className="guide-content">
                <h4>Age Limit</h4>
                <p>{event.age_limit || "All Ages"}</p>
              </div>
            </div>
            <div className="guide-item">
              <i className="fa fa-ticket" aria-hidden="true"></i>
              <div className="guide-content">
                <h4>Available Tickets</h4>
                <p>{event.tickets || "Limited"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Section */}
        <div className="venue-section">
          <h3>Venue</h3>
          <div className="venue-info">
            <i className="fa fa-map-marker" aria-hidden="true"></i>
            <span>{event.location}</span>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Info;