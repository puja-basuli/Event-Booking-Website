import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUserData() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data?.user) setUser(data.user);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    }
    getUserData();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    const { email, password } = data;
    setIsSubmitting(true);
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
      setIsSubmitting(false);
      if (error) throw error;

      alert('Login successful');
      if (data.mode === 'yes') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setIsSubmitting(false);
      alert(`Login failed: ${error.message}`);
      console.log(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      alert(`Google login failed: ${error.message}`);
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-heading">SIGN IN</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder="Enter Your Email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Enter Your Password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters long' },
              })}
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <button onClick={handleGoogleLogin} className="google-button">
          Login with Google
        </button>

        <div className="register-link">
          <span>Not Registered Yet? </span>
          <Link to="/register" className="register-link-text">Create an Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

