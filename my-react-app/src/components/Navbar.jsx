import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./api/client";

export default function Navbar() {
  const [userInfo, setUserInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
          console.log(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }
    getUserData();
  }, []);

  

  return (
    <header className="header">
      <Link to="/" className="logo">
        <i className="fa fa-snowflake-o" aria-hidden="true"></i>
        <span className="title">EveS</span>
      </Link>
      
      <div className="right">
        <Link to="/dashboard">{userInfo ? <h3 className="name">{userInfo.name}</h3> : null}</Link>
        <Link to="/dashboard">
          <i className="fa fa-bars" aria-hidden="true"></i>
          <i className="fa fa-user" aria-hidden="true"></i>
        </Link>
      </div>
    </header>
  );
}
