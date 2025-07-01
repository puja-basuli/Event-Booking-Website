import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import EventCard from "../Card/Eventcard";
import Footer from "../miscelleous/Footer";
import { supabase } from "../api/client";
import "./Hero.css";

function Hero() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 
  const today = new Date().toISOString().split("T")[0];


  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data?.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('users').select('name').eq('email', user.email).single().then(({ data }) => {
      if (data) setUserInfo(data);
    });
  }, [user]);

  useEffect(() => {
    supabase.from('event').select('*').gte('date', today).order('date', { ascending: true }).then(({ data, error }) => {
      if (error) {
        setError("Failed to load events");
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoadingEvents(false);
    });
  }, [today]);

  const filterEventsByCategory = () => {
    if (!selectedCategory) return events;
    return events.filter(event => event.category === selectedCategory);
  };

 

  return (
    <div className="firstpage">


     
      <div className="hero">
  <div className="hero-overlay">
    <h1>Discover Exciting Events Around You</h1>
    <p>Book your tickets, explore categories, and never miss a moment of fun.</p>
    <Link to="/events" className="hero-button">Browse All Events</Link>
  </div>
  <div className="hero-image"></div>
</div>




      <div className="home-section">
        <h2>Upcoming Events</h2>
        {loadingEvents ? <p>Loading...</p> : error ? <p>{error}</p> : (
          <div className="event-list">
            {filterEventsByCategory().map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Hero;
