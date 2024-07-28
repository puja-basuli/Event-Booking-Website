import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./api/client";

export default function Navbar() {
  const [userInfo, setUserInfo] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserInfo() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('newusers')
            .select('username, name')
            .eq('email', user.email)
            .single();
          if (error) {
            throw error;
          }
          setUserInfo(data);
        } catch (error) {
          console.error('Error fetching user info:', error.message);
        }
      }
    }

    fetchUserInfo();
  }, [user]);

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

  const handleLoginOrDashboard = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <i className="fa fa-snowflake-o" aria-hidden="true"></i>
        <span className="title">EveS</span>
      </Link>

      <div className="right">
        {userInfo ? (
          <Link to="/dashboard">
            <h3 className="name">{userInfo.name}</h3>
          </Link>
        ) : null}
        <Link to="/wishlist">
          <i className="fa fa-heart" aria-hidden="true"></i>
        </Link>
        <button onClick={handleLoginOrDashboard} className="icon-button invisible-button">
          <i className="fa fa-bars" aria-hidden="true"></i>
          <i className="fa fa-user" aria-hidden="true"></i>
        </button>
      </div>
    </header>
  );
}
