import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../api/client";
import './miscelleous.css';
export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user || null);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }

    getUserData();
  }, [location]); 

  useEffect(() => {
    async function fetchUserInfo() {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("admin")
            .eq("email", user.email)
            .single();

          if (error) throw error;

          setUserInfo(data);
        } catch (error) {
          console.error("Error fetching user info:", error.message);
        }
      } else {
        setUserInfo(null);
      }
    }

    fetchUserInfo();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserInfo(null);
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <i className="fa fa-snowflake-o" aria-hidden="true"></i>
        <span className="title">EveS</span>
      </Link>

      <div className="right">
        

       

        {user ? (
  <>
 {userInfo?.admin === "yes" && (
  <div className="tooltip-container">
    <Link to="/admin" className="icon-button invisible-button">
      <i className="fa fa-users" aria-hidden="true"></i>
    </Link>
    <span className="tooltip-text">Admin</span>
  </div>
)}

    <div className="tooltip-container">
      <Link to="/wishlist" className="icon-button invisible-button">
        <i className="fa fa-heart" aria-hidden="true"></i>
      </Link>
      <span className="tooltip-text">Wishlist</span>
    </div>

    <div className="tooltip-container">
      <button onClick={() => navigate("/locations")} className="icon-button invisible-button">
        <i className="fa fa-map-marker" aria-hidden="true"></i>
      </button>
      <span className="tooltip-text">Locations</span>
    </div>

    <div className="tooltip-container">
      <button onClick={() => navigate("/dashboard")} className="icon-button invisible-button">
        <i className="fa fa-user" aria-hidden="true"></i>
      </button>
      <span className="tooltip-text">Dashboard</span>
    </div>

    <div className="tooltip-container">
      <button onClick={handleLogout} className="icon-button invisible-button">
        <i className="fa fa-sign-out" aria-hidden="true"></i>
      </button>
      <span className="tooltip-text">Logout</span>
    </div>
  </>
) : (
  <div className="tooltip-container">
    <button onClick={() => navigate("/signin")} className="icon-button invisible-button">
      <i className="fa fa-sign-in" aria-hidden="true"></i>
    </button>
    <span className="tooltip-text">Sign In</span>
  </div>
)}

      </div>
    </header>
  );
}
