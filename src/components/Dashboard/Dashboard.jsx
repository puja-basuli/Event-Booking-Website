import { useEffect, useState } from "react";
import { supabase } from "../api/client";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import './Dashboard.css';
import Loader from "../miscelleous/Loader";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [booking, setBooking] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);

  // Upload image URL to Cloudinary (unsigned upload)
  const uploadImageToCloudinary = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed");

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error.message);
      return null;
    }
  };

  // Get current user from Supabase Auth
  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user || null);
      } catch (error) {
        setError("Error fetching user data");
        console.error("User fetch error:", error.message);
      } finally {
        setLoadingUser(false);
      }
    }
    getUserData();
  }, []);

  // Fetch or create user in "users" table by auth_id
  useEffect(() => {
    if (!user) return;

    async function fetchOrCreateUser() {
      setLoadingUserInfo(true);
      try {
        const { data: existing, error: fetchError } = await supabase
          .from("users")
          .select("id, auth_id, name, admin, picture")
          .eq("auth_id", user.id)
          .single();

        if (existing) {
          setUserInfo(existing);
          setNameInput(existing.name || "");
        } else {
          // Upload profile image from Supabase Auth metadata to Cloudinary
          const pictureUrl = user.user_metadata?.picture;
          let finalImageUrl = null;
          if (pictureUrl) {
            finalImageUrl = await uploadImageToCloudinary(pictureUrl);
          }

          const insertRes = await supabase
            .from("users")
            .insert({
              auth_id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || "",
              picture: finalImageUrl,
            })
            .select()
            .single();

          if (insertRes.error) throw insertRes.error;

          setUserInfo(insertRes.data);
          setNameInput(insertRes.data.name || "");
        }
      } catch (error) {
        setError("Error fetching or inserting user info");
        console.error("User info error:", error.message);
      } finally {
        setLoadingUserInfo(false);
      }
    }

    fetchOrCreateUser();
  }, [user]);

  // Fetch bookings by auth_id (user.id)
  useEffect(() => {
    if (!user) return;

    async function fetchBookings() {
      setLoadingEvents(true);
      try {
        const { data, error } = await supabase
          .from("booking")
          .select("*")
          .eq("email", user.email);
        if (error) throw error;
        setBooking(data || []);
      } catch (error) {
        setError("Error fetching bookings");
        console.error("Booking fetch error:", error.message);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchBookings();
  }, [user]);

  // Save updated name to users table
  const saveUserInfo = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ name: nameInput })
        .eq("auth_id", user.id);
      if (error) throw error;

      setUserInfo((prev) => ({ ...prev, name: nameInput }));
      setIsEditing(false);
      toast.success("Name updated successfully");
    } catch (error) {
      setError("Error saving user info");
      console.error("Save error:", error.message);
    }
  };

  const toggleEditing = () => setIsEditing(!isEditing);
  const handleNameChange = (e) => setNameInput(e.target.value);

  const categorizeEvents = (events) => {
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.date) >= now);
    const past = events.filter((e) => new Date(e.date) < now);
    return { upcoming, past };
  };

  if (loadingUser || loadingUserInfo || loadingEvents) return <div><Loader /></div>;

  const { upcoming: upcomingEvents, past: pastEvents } = categorizeEvents(booking);

  return (
    <div className="dashboard">
      <div className="dashboard-header"></div>

      <div className="wrapper">
        <div className="profile">
          {userInfo?.picture ? (
            <img
              src={userInfo.picture}
              alt="Profile"
              style={{ width: 100, height: 100, borderRadius: '50%' }}
            />
          ) : (
            <i className="fa fa-user-circle fa-3x" aria-hidden="true"></i>
          )}
          {userInfo && (
            <>
              <h4>
                <br />
                Name: {isEditing || !userInfo.name ? (
                  <input
                    type="text"
                    value={nameInput}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  userInfo.name || "N/A"
                )}
                <br />
                Email: <span className="email-display">{user.email}</span>
              </h4>
              {isEditing || !userInfo.name ? (
                <button className="btn-edit" onClick={saveUserInfo}>
                  <i className="fa fa-save" aria-hidden="true"></i>
                </button>
              ) : (
                <button className="btn-edit" onClick={toggleEditing}>
                  <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                </button>
              )}
            </>
          )}
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
                    <h4>{event.attendee}</h4>
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
