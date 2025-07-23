import { useEffect, useState } from "react";
import { supabase } from "../api/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import './Dashboard.css';

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload image URL to Cloudinary
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
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error.message);
      return null;
    }
  };

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
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

        // Check if user exists in users table
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", authUser.id)
          .single();

        if (existingUser) {
          setUserInfo(existingUser);
          setFormData({ name: existingUser.name || "" });
        } else {
          // Create new user record
          let profileImageUrl = null;
          if (authUser.user_metadata?.picture) {
            profileImageUrl = await uploadImageToCloudinary(authUser.user_metadata.picture);
          }

          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              auth_id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.full_name || "",
              picture: profileImageUrl,
              admin: "no"
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setUserInfo(newUser);
          setFormData({ name: newUser.name || "" });
        }

        // Fetch user bookings
        await fetchBookings(authUser.email);

      } catch (error) {
        console.error("Error initializing user:", error);
        setError("Failed to load user data");
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [navigate]);

  const fetchBookings = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from("booking")
        .select(`
          *,
          event:event_id (
            name,
            date,
            time,
            location,
            image
          )
        `)
        .eq("email", userEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ name: formData.name })
        .eq("auth_id", user.id);

      if (error) throw error;

      setUserInfo(prev => ({ ...prev, name: formData.name }));
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const categorizeBookings = (bookings) => {
    const now = new Date();
    const upcoming = bookings.filter(booking => {
      if (!booking.event?.date) return false;
      return new Date(booking.event.date) >= now;
    });
    const past = bookings.filter(booking => {
      if (!booking.event?.date) return false;
      return new Date(booking.event.date) < now;
    });
    return { upcoming, past };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
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
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="error-state">
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

  const { upcoming, past } = categorizeBookings(bookings);
  const currentBookings = activeTab === "upcoming" ? upcoming : past;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {userInfo?.name || "User"}!</h1>
          <p>Manage your profile and view your event bookings</p>
        </div>

        <div className="dashboard-content">
          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-header">
              {userInfo?.picture ? (
                <img
                  src={userInfo.picture}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  <i className="fa fa-user" aria-hidden="true"></i>
                </div>
              )}
              
              <div className="profile-info">
                <h2>{userInfo?.name || "User"}</h2>
                <p>{user?.email}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-actions">
                  <button onClick={handleSaveProfile} className="btn-save">
                    <i className="fa fa-save" aria-hidden="true"></i> Save Changes
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: userInfo?.name || "" });
                    }} 
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-actions">
                <button onClick={() => setIsEditing(true)} className="btn-edit">
                  <i className="fa fa-edit" aria-hidden="true"></i> Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Events Section */}
          <div className="events-section">
            <div className="events-header">
              <h3>My Bookings</h3>
              <div className="events-tabs">
                <button
                  className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming ({upcoming.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
                  onClick={() => setActiveTab("past")}
                >
                  Past ({past.length})
                </button>
              </div>
            </div>

            {currentBookings.length > 0 ? (
              <div className="events-grid">
                {currentBookings.map((booking) => (
                  <div key={booking.id} className="event-card">
                    <h4>{booking.event?.name || "Event Name"}</h4>
                    
                    <div className="event-meta">
                      <div className="event-meta-item">
                        <i className="fa fa-calendar" aria-hidden="true"></i>
                        <span>{formatDate(booking.event?.date)}</span>
                      </div>
                      
                      {booking.event?.time && (
                        <div className="event-meta-item">
                          <i className="fa fa-clock-o" aria-hidden="true"></i>
                          <span>{formatTime(booking.event.time)}</span>
                        </div>
                      )}
                      
                      <div className="event-meta-item">
                        <i className="fa fa-map-marker" aria-hidden="true"></i>
                        <span>{booking.event?.location || "Location TBD"}</span>
                      </div>
                      
                      {booking.seat_number && (
                        <div className="event-meta-item">
                          <i className="fa fa-ticket" aria-hidden="true"></i>
                          <span>Seat: {booking.seat_number}</span>
                        </div>
                      )}
                    </div>

                    <div className="event-amount">₹{booking.amount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events">
                <i className="fa fa-calendar-o" aria-hidden="true"></i>
                <h4>No {activeTab} events</h4>
                <p>
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming events. Discover exciting events to book!"
                    : "You haven't attended any events yet."
                  }
                </p>
                {activeTab === "upcoming" && (
                  <Link to="/" className="browse-events-btn">
                    Browse Events
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Logout Section */}
          <div className="logout-section">
            <button onClick={handleLogout} className="btn-logout">
              <i className="fa fa-sign-out" aria-hidden="true"></i> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;