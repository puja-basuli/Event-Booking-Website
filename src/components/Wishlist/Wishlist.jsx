import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/client";
import { toast } from "react-hot-toast";
import EventCard from "../Card/Eventcard";
import Footer from "../miscelleous/Footer";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeWishlist = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (!authUser) {
          navigate("/signin");
          return;
        }

        setUser(authUser);
        await fetchWishlistEvents(authUser.email);
      } catch (error) {
        console.error("Error initializing wishlist:", error);
        setError("Failed to load wishlist");
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    initializeWishlist();
  }, [navigate]);

  const fetchWishlistEvents = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform wishlist data to event format
      const transformedEvents = data.map(item => ({
        id: item.event_id,
        name: item.event_name,
        date: item.event_date,
        location: item.event_location,
        image: item.event_image,
        amount: item.event_amount,
        wishlist_id: item.id
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }
  };

  const handleRemoveFromWishlist = async (eventId) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('event_id', eventId)
        .eq('user_email', user.email);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleWishlistChange = () => {
    // Refresh wishlist when an item is removed
    if (user) {
      fetchWishlistEvents(user.email);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="error-container">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>Events you've saved for later</p>
        </div>

        {events.length > 0 ? (
          <div className="wishlist-grid">
            {events.map((event) => (
              <div key={event.id} className="wishlist-item">
                <EventCard 
                  event={event} 
                  onWishlistChange={handleWishlistChange}
                />
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveFromWishlist(event.id)}
                >
                  <i className="fa fa-trash" aria-hidden="true"></i>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-wishlist">
            <div className="empty-icon">
              <i className="fa fa-heart-o" aria-hidden="true"></i>
            </div>
            <h3>Your wishlist is empty</h3>
            <p>Start adding events you're interested in to keep track of them!</p>
            <button 
              onClick={() => navigate("/")} 
              className="browse-events-btn"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Wishlist;