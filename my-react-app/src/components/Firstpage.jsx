import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import EventCard from "./Frontpagecard/Eventcard";
import Footer from "./Footer";
import { supabase } from "./api/client";


function Firstpage() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .storage
        .from('images')
        .list('public', { limit: 100 });

      if (error) {
        console.error(error);
      } else {
        const imageUrls = data.map(file => supabase.storage.from('images').getPublicUrl(`public/${file.name}`).publicURL);
        setImages(imageUrls);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoadingEvents(true);
    try {
      let { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today) // Fetch events where the date is greater than or equal to today
        .order('date', { ascending: true }); // Ensure events are sorted by date
      if (error) throw error;
      setEvents(events);
    } catch (error) {
      setError('Error fetching events. Please try again later.');
      console.error('Error fetching events:', error.message);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function fetchImageUrls() {
    setLoadingImages(true);
    try {
      const { data, error } = await supabase
        .from('images')
        .select('url');
      if (error) throw error;

      const urls = data.map(image => image.url);
      setImages(urls);
    } catch (error) {
      setError('Error fetching images. Please try again later.');
      console.error('Error fetching image URLs:', error.message);
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    fetchImageUrls();
  }, []);

  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }
    getUserData();
  }, []);

  useEffect(() => {
    async function fetchUserInfo() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('newusers')
            .select('username, name')
            .eq('email', user.email)
            .single();
          if (error) throw error;
          setUserInfo(data);
        } catch (error) {
          console.error('Error fetching user info:', error.message);
        }
      }
    }
    fetchUserInfo();
  }, [user]);

  const filterEventsByCategory = () => {
    if (!selectedCategory) return events;
    return events.filter(event => event.category === selectedCategory);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const categories = [
    { name: '', icon: 'fa-list', category: null },
    { name: 'Movies', icon: 'fa-film', category: 'Movies' },
    { name: 'Sports', icon: 'fa-futbol-o', category: 'Sports' },
    { name: 'Tour', icon: 'fa-tree', category: 'Tour' },

    { name: 'Homestays', icon: 'fa-list', category: 'Home' },
    { name: 'Activities', icon: 'fa-asterisk', category: 'Activites' },
  ];

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .ilike('name', `%${e.target.value}%`)
          .gte('date', today); // Only search for events beyond today
        if (error) {
          throw error;
        }
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error.message);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (eventId) => {
    navigate(`/booking/${eventId}`);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div>
      <div className="header-banner"></div>
      <div className="flexx">
        <div className="wrapper">

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => handleResultClick(event.id)} />
                ))}
              </div>
            )}
          </div>

          <div className="user-greeting">
            {userInfo ? (
              <Link to="/dashboard">
                <h2 className="hello-message">Hello</h2>
              </Link>
            ) : (
              <div className="placeholder"></div>
            )}
          </div>

          <div className="category-select">
            {categories.map((category, index) => (
              <button key={index} onClick={() => handleCategorySelect(category.category)}>
                <i className={`fa ${category.icon}`} aria-hidden="true"></i> {category.name}
              </button>
            ))}
          </div>

          {loadingImages ? (
            <p>Loading images...</p>
          ) : (
            <Carousel>
              {images.map((url, index) => (
                <div key={index}>
                  <img src={url} alt={`Slide ${index}`} />
                </div>
              ))}
            </Carousel>
          )}

          <div className="home-section">
            <h1>Upcoming Events</h1>
            {loadingEvents ? (
              <p>Loading events...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <div className="event-list">
                {filterEventsByCategory().map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Firstpage;
