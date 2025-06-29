import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import EventCard from "./Frontpagecard/Eventcard";
import Footer from "./miscelleous/Footer";
import { supabase } from "./api/client";

function Firstpage() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  // Fetch authenticated user
  useEffect(() => {
    async function getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data?.user) setUser(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }
    getUser();
  }, []);

  // Fetch user info from 'users' table (not 'newusers')
  useEffect(() => {
    async function fetchUserInfo() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // ignore no rows error (if you want)

        if (data) setUserInfo(data);
        else setUserInfo(null);
      } catch (error) {
        console.error('Error fetching user info:', error.message);
      }
    }
    fetchUserInfo();
  }, [user]);

  // Fetch upcoming events filtered by date, ordered ascending
  useEffect(() => {
    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        let { data, error } = await supabase
          .from('event')
          .select('*')
          .gte('date', today)
          .order('date', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
        setError(null);
      } catch (error) {
        setError('Error fetching events. Please try again later.');
        console.error('Error fetching events:', error.message);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, [today]);

  // Fetch image URLs from Supabase storage bucket 'images/public'
  useEffect(() => {
    async function fetchImages() {
      setLoadingImages(true);
      try {
        const { data, error } = await supabase
          .storage
          .from('event-images')
          .list('public', { limit: 100 });

        if (error) throw error;

        const imageUrls = data.map(file => 
          supabase.storage.from('event-images').getPublicUrl(`public/${file.name}`).publicUrl
        );

        setImages(imageUrls);
        setError(null);
      } catch (error) {
        setError('Error fetching images. Please try again later.');
        console.error('Error fetching images:', error.message);
      } finally {
        setLoadingImages(false);
      }
    }
    fetchImages();
  }, []);

  // Filter events by selected category
  const filterEventsByCategory = () => {
    if (!selectedCategory) return events;
    return events.filter(event => event.category === selectedCategory);
  };

  // Category buttons
  const categories = [
    { name: 'All', icon: 'fa-list', category: null },
    { name: 'Entertainment', icon: 'fa-film', category: 'Movies' },
    { name: 'Sports', icon: 'fa-futbol-o', category: 'Sports' },
    { name: 'Tour', icon: 'fa-tree', category: 'Tour' },
    { name: 'Rides', icon: 'fa-star', category: 'Rides' },
    { name: 'Homestays', icon: 'fa-home', category: 'Home' },
    { name: 'Activities', icon: 'fa-asterisk', category: 'Activities' }, // fixed typo here
  ];

  // Handle search input change and search events by name
  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .ilike('name', `%${val}%`)
        .gte('date', today);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error fetching search results:', error.message);
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
              aria-label="Search events"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => handleResultClick(event.id)} />
                ))}
              </div>
            )}
          </div>

         
          <div className="category-select">
            {categories.map(({ name, icon, category }, index) => (
              <button key={index} onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? "selected" : ""}>
                <i className={`fa ${icon}`} aria-hidden="true"></i> {name}
              </button>
            ))}
          </div>

          {loadingImages ? (
            <p>Loading images...</p>
          ) : (
            <Carousel showThumbs={false} infiniteLoop autoPlay>
              {images.map((url, index) => (
                <div key={index}>
                  <img src={url} alt={`Slide ${index + 1}`} />
                </div>
              ))}
            </Carousel>
          )}

          <div className="home-section">
            <h1>Upcoming Events</h1>
            {loadingEvents ? (
              <p>Loading events...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
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
