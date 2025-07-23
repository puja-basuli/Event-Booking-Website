import { useState } from 'react';
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
    watch
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    const { email, password, name } = data;
    setIsSubmitting(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: name,
            name: name
          },
        },
      });

      if (signUpError) throw signUpError;

      toast.success('Account created successfully! Welcome to EveS!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Signup failed');
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message || 'Google Sign-Up failed');
      console.error('Google signup error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-heading">Create Account</h2>
        <p className="login-subheading">Join EveS and discover amazing events</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              {...register("name", { 
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters"
                }
              })}
            />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>
          
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Create a password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                }
              })}
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: value => value === password || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Creating account
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="divider">or</div>

        <button onClick={handleGoogleSignUp} className="google-button">
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <div className="register-link">
          <span>Already have an account? </span>
          <Link to="/signin" className="register-link-text">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;