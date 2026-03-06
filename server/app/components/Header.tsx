"use client";
import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="header" style={scrolled ? { boxShadow: "0 4px 24px rgba(0,0,0,0.06)" } : {}}>
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <span className="logo-text">QuizAI</span>
        </div>
        <nav className="nav">
          {["Features", "Pricing", "About", "Community"].map((item) => (
            <a key={item} href="#">{item}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="btn-login">Log In</button>
          <button className="btn-primary">Get Started</button>
        </div>
      </div>
    </header>
  );
}
