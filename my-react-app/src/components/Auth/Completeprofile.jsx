import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../api/client';
import { useNavigate } from 'react-router-dom';


const CompleteProfile = () => {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        navigate("/login");
      }
    }

    getUserData();
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { username, name } = data;
    setIsSubmitting(true);
    try {
      const { email } = user;

      const { error } = await supabase
        .from("newusers")
        .upsert([{ email, username, name, admin: "no" }]);

      if (error) {
        throw error;
      }

      alert("Profile completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      setIsSubmitting(false);
      alert(`Profile completion failed: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-box">
        <h2 className="complete-profile-heading">Complete Your Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="complete-profile-form">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Your Username"
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && <p className="error-message">{errors.username.message}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Your Name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
