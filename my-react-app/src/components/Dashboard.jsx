import React, { useEffect, useState } from "react";
import { supabase } from "./api/client";
import { useNavigate, Link } from "react-router-dom";
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        setError("Error fetching user data");
        console.error("Error fetching user data:", error.message);
      } finally {
        setLoadingUser(false);
      }
    }
    getUserData();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchUserInfo() {
      try {
        const { data, error } = await supabase
          .from('newusers')
          .select('username, name, admin')
          .eq('email', user.email)
          .single();
        if (error) {
          throw error;
        }
        setUserInfo(data);
        setNameInput(data.name);
      } catch (error) {
        setError("Error fetching user info");
        console.error('Error fetching user info:', error.message);
      } finally {
        setLoadingUserInfo(false);
      }
    }
    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    if (userInfo?.admin === "yes") {
      navigate("/admin");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/login");
    }
  }

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleNameChange = (e) => {
    setNameInput(e.target.value);
  };

  const saveUserInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('newusers')
        .update({ name: nameInput })
        .eq('email', user.email);
      if (error) {
        throw error;
      }
      setUserInfo((prev) => ({ ...prev, name: nameInput }));
      setIsEditing(false);
      console.log('User info saved successfully:', data);
    } catch (error) {
      setError("Error saving user info");
      console.error('Error saving user info:', error.message);
    }
  };

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from("booking")
        .select("*")
        .eq('email', user.email);
      if (error) throw error;
      setBooking(data);
    } catch (error) {
      setError("Error fetching events");
      console.error("Error fetching events:", error.message);
    } finally {
      setLoadingEvents(false);
    }
  }

  const categorizeEvents = (events) => {
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) >= now);
    const pastEvents = events.filter(event => new Date(event.date) < now);
    return { upcomingEvents, pastEvents };
  };

  if (loadingUser || loadingUserInfo || loadingEvents) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <>
        <div className="dash"></div>
        <div className="message-pop">
          <div>
            <h2> NO SESSION FOUND</h2>
            <Link to="/login"><button>SIGN IN</button></Link>
            <Link to="/register"><button>SIGN UP</button></Link>
          </div>
        </div>
      </>
    );
  }

  const { upcomingEvents, pastEvents } = categorizeEvents(booking);

  return (
    <div className="dashboard">
      <div className="dashboard-header"></div>
      <div className="wrapper">
        <div className="profile">
          <i className="fa fa-user-circle fa-3x" aria-hidden="true"></i>
          {userInfo && (
            <>
              <h4>
                Username: {userInfo.username}
                <br />
                Name: {isEditing ? (
                  <input
                    type="text"
                    value={nameInput}
                    onChange={handleNameChange}
                  />
                ) : (
                  userInfo.name
                )}
                <br />
                Email: {user.email}
              </h4>
              {isEditing ? (
                <button className="btn-save" onClick={saveUserInfo}>
                  Save
                </button>
              ) : (
                <button className="btn-edit" onClick={toggleEditing}>
                  <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                </button>
              )}
            </>
          )}
        </div>
        <div className="signout">
          <button className="btn-signout" onClick={signOutUser}>
            SIGN OUT
          </button>
        </div>
        <div className="bookings">
          <div className="events">
            <h3>Upcoming Events</h3>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link to={`/event/${event.id}`} state={{ event }} key={event.id}>
                  <div className="event-card">
                    <h4>{event.name}</h4>
                    <p>{event.time}</p>
                    <p>{event.date}</p>
                    <p>{event.seatno}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p>No upcoming events found</p>
            )}
          </div>
          <div className="events">
            <h3>Past Events</h3>
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => (
                <Link to={`/event/${event.id}`} state={{ event }} key={event.id}>
                  <div className="event-card">
                    <h4>{event.name}</h4>
                    <p>{event.time}</p>
                    <p>{event.date}</p>
                    <p>{event.seatno}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p>No past events found</p>
            )}
          </div>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default Dashboard;
