import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Login.css';

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { email, password, name } = data;
    setIsSubmitting(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (signUpError) throw signUpError;

      toast.success('Signup successful! Please verify your email.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Signup failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href, // redirect back to this page
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(`Google Sign-Up failed: ${error.message}`);
    }
  };

  // No user insertion here; dashboard will handle it

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-heading">SIGN UP</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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
          <Link to="/signin" className="register-link-text">Sign-in Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
