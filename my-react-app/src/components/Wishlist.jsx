import React from "react";
import EventCard from "./Frontpagecard/Eventcard";
import { supabase } from "./api/client";
import { useState,useEffect } from "react";

const Wishlist = () => {

    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [error, setError] = useState(null);
    const today = new Date().toISOString().split('T')[0]; 
  
    useEffect(() => {
      async function getUserData() {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error) {
            throw error;
          }
          if (data?.user) {
            setUser(data.user);
          }
        } catch (error) {
          setError('Error fetching user data');
          console.error('Error fetching user data:', error.message);
        } finally {
          setLoadingUser(false);
        }
      }
      getUserData();
    }, []);
  
    useEffect(() => {
      if (user) {
        fetchEvents();
      }
    }, [user]);
  
    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        let { data: events, error } = await supabase
          .from('wishlist')
          .select('*')
          .eq('email', user.email)
          .gte('date', today)
          .order('date', { ascending: true });
        if (error) throw error;
        setEvents(events);
      } catch (error) {
        setError('Error fetching events. Please try again later.');
        console.error('Error fetching events:', error.message);
      } finally {
        setLoadingEvents(false);
      }
    }
  
    if (loadingUser) {
      return <div>Loading user data...</div>;
    }
  
    return (
      <div>
        <div className="gap"></div>
        <div className="wish-box">
          {loadingEvents ? (
            <div>Loading events...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      </div>
    );
  };
  
  export default Wishlist;