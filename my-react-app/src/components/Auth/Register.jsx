import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; 

const Register = () => {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("no");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const ADMIN_KEY = "xyzadmin";

  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        if (data?.user) {
          setUser(data.user);
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }

    if (!user) {
      getUserData();
    }
  }, [navigate, user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { email, password, username, name } = data;
    setIsSubmitting(true);
    try {
      if (mode === "yes") {
        const enteredKey = prompt("Enter the admin key");
        if (enteredKey !== ADMIN_KEY) {
          alert("Wrong admin key");
          setIsSubmitting(false);
          return;
        }
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      alert("Signup successful, please check your email for verification link!");
      await saveUserInfo({ email, username, name, mode });
      navigate("/dashboard");
    } catch (error) {
      setIsSubmitting(false);
      alert(`Signup failed: ${error.message}`);
    }
  };

  const saveUserInfo = async (user) => {
    const { email, username, name, mode } = user;
    const { error } = await supabase
      .from("newusers")
      .insert([{ username, email, name, admin: mode }]);

    if (error) {
      console.error("Error saving user info:", error.message);
    } else {
      console.log("User info saved successfully");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
      navigate("/complete-profile");
    } catch (error) {
      alert(`Google Sign-Up failed: ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-heading">SIGN UP</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder="Enter Your Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /@/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Enter Your Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>
          <div className="radio-group">
            <input
              type="radio"
              name="mode"
              id="User"
              checked={mode === "no"}
              onChange={() => setMode("no")}
              required
            />
            <label htmlFor="User">User</label>
            <input
              type="radio"
              name="mode"
              id="Admin"
              checked={mode === "yes"}
              onChange={() => setMode("yes")}
              required
            />
            <label htmlFor="Admin">Admin</label>
          </div>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <button onClick={handleGoogleSignUp} className="google-button">
          Sign Up with Google
        </button>
        <div className="register-link">
          <span>Already have an account?</span>
          <br />
          <Link to="/login" className="register-link-text">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
