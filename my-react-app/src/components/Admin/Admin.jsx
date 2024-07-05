import React, { useState, useEffect } from "react";
import { supabase } from "../api/client";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Admin2.css"
const Admin = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [events, setEvents] = useState([]);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq('email', user.email);
      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  }

  useEffect(() => {
    if (userInfo?.admin === "no") {
      navigate("/dashboard");
    }
  }, [userInfo, navigate]);

  async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/login");
    }
  }

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
        console.error("Error fetching user data:", error.message);
      }
    }
    getUserData();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchUserInfo() {
      try {
        const { data, error } = await supabase
          .from("newusers")
          .select("username, name, admin")
          .eq("email", user.email)
          .single();
        if (error) {
          throw error;
        }
        setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user info:", error.message);
      }
    }
    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <div className="dash1"></div>
        <div className="wr1">
          <p className="white">You're not logged in...</p>
          <Link to="/login">
            <button className="out">LOGIN</button>
          </Link>
          <br />
          <Link to="/register">
            <button className="out">SIGN UP</button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="dash"></div>
      <div className="admin-info">
        <h2>Welcome, {userInfo?.name}</h2>
        <p>Username: {userInfo?.username}</p>
        <button onClick={signOutUser} className="out">Sign Out</button>
      </div>
      <div className="add-event">
        <button onClick={() => navigate("/admin/add")}>Add Event</button>
      </div>
      <div className="events">
        <h3>Your Events</h3>
        {events.length > 0 ? (
          events.map((event) => (
            <Link to="/admin/edit" state={{event}}>
            <div key={event.id} className="event-card">
              <h4>{event.name}</h4>
              <p>{event.location}</p>
              <p>{event.time}</p>
              <p>{event.date}</p>
              <p>{event.seats}</p>
              <p>{event.price}</p>
              
            </div>
            </Link>
          ))
        ) : (
          <p>No events found</p>
        )}
      </div>
    </div>
  );
};

export default Admin;
