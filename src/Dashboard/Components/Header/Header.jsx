// src/components/Header.js
import React from "react";
import "./Header.css";
import { Link } from 'react-router-dom';

const Header = () => {
  const user = localStorage.getItem("name") || "";

  return (
    <header1 className="header1">
      <div className="welcome-message">
        <h1>Welcome Back, {user}!</h1>
        <p>
          There are many variations of passages of Lorem Ipsum available, but
          the majority have suffered alteration
        </p>
        <Link to={'./Courses'}>
        <button>Get Started</button>
        </Link>
      </div>
    </header1>
  );
};

export default Header;
