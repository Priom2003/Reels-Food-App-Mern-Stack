import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth-shared.css';
import axios from 'axios';

const FoodPartnerLogin = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const email = e.target.email.value;
      const password = e.target.password.value;

      const response = await axios.post(

        `${import.meta.env.VITE_API_URL}/api/auth/food-partner/login`,

        {
          email,
          password
        },

        {
          withCredentials: true
        }

      );

      console.log(response.data);

      setTimeout(() => {

        navigate("/create-food", {
          replace: true
        });

      }, 100);

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">

      <div
        className="auth-card"
        role="region"
        aria-labelledby="partner-login-title"
      >

        <header>

          <h1
            id="partner-login-title"
            className="auth-title"
          >
            Partner login
          </h1>

          <p className="auth-subtitle">
            Access your dashboard and manage orders.
          </p>

        </header>

        <nav
          className="auth-alt-action"
          style={{ marginTop: '-4px' }}
        >

          <strong style={{ fontWeight: 600 }}>
            Switch:
          </strong>

          <Link to="/user/login">
            User
          </Link>

          •

          <Link to="/food-partner/login">
            Food partner
          </Link>

        </nav>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="field-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="business@example.com"
              autoComplete="email"
            />

          </div>

          <div className="field-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
            />

          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {
              loading
                ? "Signing In..."
                : "Sign In"
            }
          </button>

        </form>

        <div className="auth-alt-action">

          New partner?

          <Link to="/food-partner/register">
            Create an account
          </Link>

        </div>

      </div>

    </div>
  );
};

export default FoodPartnerLogin;