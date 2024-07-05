import React, { useState, useEffect } from "react";
import { supabase } from "../api/client";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Admin.css"

const Add = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState({});
  const [events, setEvents] = useState([]);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event) => {
    setUploading(true);
    let file = event.target.files[0];

    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(`public/${file.name}`, file);

    if (error) {
      console.error(error);
    } else {
      console.log('Image uploaded:', data);
    }
    setUploading(false);
  };
  async function fetchRegisteredUsers(eventId) {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("email")
        .eq("event_id", eventId);
      if (error) throw error;
      setRegisteredUsers((prev) => ({ ...prev, [eventId]: data }));
    } catch (error) {
      console.error("Error fetching registered users:", error.message);
    }
  }

 

  async function addEvent(event) {
    event.preventDefault();
    try {
      const { data, error } = await supabase.from("events").insert([
        {
          name,
          location,
          time,
          date,
          seats: seatsAvailable,
          img: imageUrl,
          price,
          description,
          email: userInfo.email,
        },
      ]);
      if (error) throw error;
      alert("Event added successfully:", data);
      fetchEvents();
      setName("");
      setLocation("");
      setDate("");
      setTime("");
      setDate("");
      setPrice("");
      setSeatsAvailable("");
      setImageUrl("");
      setDescription("");
    } catch (error) {
      console.error("Error adding event:", error.message);
    }
  }

  async function fetchEvents() {
    try {
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  }

 

  useEffect(() => {
    fetchEvents();
  }, []);

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
const nav=()=>{
    navigate("/admin")
}
  return (
   
      <div>
       
        <div className="dash"></div>
          <div className="flex-container">
            
            <div className="form-container">
              <form onSubmit={addEvent}>
              <button className="out" onClick={nav}>Go back</button>
                <p className="form-title">ADD EVENT</p>
              
                <label>
                  Event Name:
                  <br />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Location:<br />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </label>
                <label>
                  Time:<br />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
                <label>
                  Date:<br />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label>
                  Seats Available:<br />
                  <input
                    type="number"
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(e.target.value)}
                  />
                </label>
                <label>
                  Price:<br />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </label>
                <label>
                  Image Upload:
                 
      <input type="file" onChange={uploadImage} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
    
                </label>
                <label>
                  Description:<br />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
                <button type="submit" className="submit-button">Add Event</button>
              </form>
            </div>
          </div>
         
        </div>
     
    );
    
};
export default Add;