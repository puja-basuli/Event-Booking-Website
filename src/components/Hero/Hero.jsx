import { useEffect, useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
=======
import { useNavigate } from "react-router-dom";
>>>>>>> c66a3d2 (fix: booking, ui)
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import EventCard from "../Card/Eventcard";
import Footer from "../miscelleous/Footer";
import { supabase } from "../api/client";
import "./Hero.css";

function Hero() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [events, setEvents] = useState([]);
<<<<<<< HEAD
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [locations, setLocations] = useState([]);
=======
>>>>>>> c66a3d2 (fix: booking, ui)
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.log("No active user session");
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUserInfo = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single();
        if (data) setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const { data, error } = await supabase
          .from('event')
          .select('*')
          .gte('date', today)
          .order('date', { ascending: true });
        
        if (error) throw error;
        
        setEvents(data || []);
<<<<<<< HEAD
        
        // Extract unique locations
        const uniqueLocations = [...new Set(data?.map(event => event.location) || [])];
        setLocations(uniqueLocations);
        
=======
>>>>>>> c66a3d2 (fix: booking, ui)
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events");
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    fetchEvents();
  }, [today]);

<<<<<<< HEAD
  const filterEventsByLocation = () => {
    if (selectedLocation === "all") return events;
    return events.filter(event => event.location === selectedLocation);
  };

=======
>>>>>>> c66a3d2 (fix: booking, ui)
  return (
    <div className="firstpage">
      <div className="hero">
        <div className="hero-overlay">
          <h1>Experience Magic in Every Moment</h1>
          <p>Discover enchanting events, create beautiful memories, and immerse yourself in extraordinary experiences that touch your soul.</p>
<<<<<<< HEAD
          <Link to="#events" className="hero-button">Explore Events</Link>
=======
>>>>>>> c66a3d2 (fix: booking, ui)
        </div>
        <div className="hero-image"></div>
      </div>

      <div className="home-section" id="events">
        <h2>Upcoming Events</h2>
<<<<<<< HEAD
        
        {/* Location Filter */}
        {locations.length > 0 && (
          <div className="location-filter">
            <button
              className={`location-btn ${selectedLocation === "all" ? "active" : ""}`}
              onClick={() => setSelectedLocation("all")}
            >
              All Locations
            </button>
            {locations.map(location => (
              <button
                key={location}
                className={`location-btn ${selectedLocation === location ? "active" : ""}`}
                onClick={() => setSelectedLocation(location)}
              >
                {location}
              </button>
            ))}
          </div>
        )}
        
=======

>>>>>>> c66a3d2 (fix: booking, ui)
        {loadingEvents ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : (
          <div className="event-list">
<<<<<<< HEAD
            {filterEventsByLocation().length > 0 ? (
              filterEventsByLocation().map(event => (
=======
            {events.length > 0 ? (
              events.map(event => (
>>>>>>> c66a3d2 (fix: booking, ui)
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="no-events">
                <i className="fa fa-calendar-o" aria-hidden="true"></i>
                <h3>No events found</h3>
<<<<<<< HEAD
                <p>
                  {selectedLocation === "all" 
                    ? "No upcoming events available at the moment."
                    : `No upcoming events in ${selectedLocation}.`
                  }
                </p>
=======
                <p>No upcoming events available at the moment.</p>
>>>>>>> c66a3d2 (fix: booking, ui)
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Hero;
