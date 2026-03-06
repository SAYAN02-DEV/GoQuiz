import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6RcrM1xQmVZFeGlX3abePLGTf3x2tohsNqTk5U38d8S0fpxhQQcVJIwRAfygZgUbH4Gy02f49mNcYRlIwsNnjb4zp1HX3-r6K7FS8m25MYE0VVvTWTxrcOQICMDjsvJfJ0e7vXhLweOU3unyrcmA5mI0CvlKu9i0Upm03MawKfiQaU6pIeuizyw-1xsLdXSm8PO53scy0hJfjuDZq0hv8LHG2a9yOaaR1xizWzCAt2LcKiQQO3e2Hxa3zCkJE2GKoVEl0dqVQ6Q",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCLzWK3b7R8enR_RtfSh66jpOlL5NAThD0yXasPIC45zUcyhCkCEOKklfNhK-lO90Gls6p4Z9paAaSqtLSIYfEGWJBsC5vhOxo1KcYe_Ah8z0_fBgHXwVcp7sOv7hFZC4ZLaOQxLq8hBuw6VZYi62E37fZCNSZk6H2pomyKhhCRY0pvHzPD8aR0lmE04uBNSWeVDKXvdwUAFOXfe4xbLjmrT8pqneOO-fevdye671Avj3DnS-h1d_T-0vpiUwA0IouzxMEo_wWMuQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBt9IdNHbbU9AMF4Lg9MLLknQU0ZxyZi7sJs69FLLXK1YCBDRjCAzzb6kr2zeo9Ob_-IGuCb0Zbd6OdnSg0Yf4ULwg-KFdobEzG54bisfn9nQcGYrjhyDcUWnYMvFDEZwOaUGuiEG-P9KaZZxMGJEG8ws1IzG6lEK2VfK20RpWr-Nuy3r3VXnhWGiKdCK1bkocfGZw856cvhzT57yUMHKful-7h0Lo91RwHp5SgsRpjAOx5JJiIk74vXDzuDeFS8MtSz7cEkN2geQ",
];

const FEATURES = [
  { icon: "temp_preferences_custom", title: "AI Question Generator", desc: "Instantly create high-quality quizzes from any text or topic using our proprietary AI engine." },
  { icon: "analytics",               title: "Smart Analytics",       desc: "Track your learning journey with granular insights and personalized study recommendations." },
  { icon: "emoji_events",            title: "Global Leaderboards",   desc: "Compete with learners worldwide, earn badges, and climb the ranks in our community." },
];

export default function QuizAILanding() {
  return (
    <div className="quiz-root">

      <Header />

      <main style={{ flex: 1 }}>

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="material-symbols-outlined">bolt</span>
                The Future of Learning is Here
              </div>
              <h1 className="hero-title">
                Master Any Subject with <span>AI-Powered</span> Quizzes
              </h1>
              <p className="hero-desc">
                Experience the next evolution of education. Create custom challenges, track your growth, and conquer your academic goals with personalized AI study paths.
              </p>
              <div className="hero-btns">
                <button className="btn-hero-primary">Start Quiz Now</button>
                <button className="btn-hero-outline">View Demo</button>
              </div>
              <div className="hero-social-proof">
                <div className="avatars">
                  {AVATARS.map((src, i) => <img key={i} src={src} alt="User" />)}
                </div>
                <p className="social-text">Joined by 10k+ active learners</p>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card-glow" />
              <div className="hero-card">
                <img
                  className="hero-card-img"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYyJjLJA2HmWYnrIatCDs8xvih5N8V9s4XiXeBvVzmj9_2Gmqwm6vizHJkjSJ0Z8_7QvaMIsfl9QuWS2Q8mw-V6y4VuI8nSpbVz5zzf9PqICvA3HIMV6t6sgvh0EmsfkJ9Db53ychkRQCDjY3ok6kMBfh-pSuUVC1gdlYlm0ZAnza2P_uX-bv_vm6L7q4Azjc1r_a1qQOUecI26lIMlTIFxcyipbTva2PrUPTZLhI_Rz2V0Q2bOGs96JWhxyqyN231kAuQCvy1CA"
                  alt="Dashboard preview"
                />
              </div>
              <div className="hero-stat-badge">
                <div className="hero-stat-icon">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="hero-stat-label">Average Score</p>
                  <p className="hero-stat-value">+84% Growth</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features">
          <div className="features-inner">
            <div className="features-header">
              <h2 className="features-title">Supercharge Your Learning</h2>
              <p className="features-desc">
                Our platform uses advanced AI to make studying more engaging and effective than ever before.
              </p>
            </div>
            <div className="features-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon">
                    <span className="material-symbols-outlined">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="feature-title">{f.title}</h3>
                    <p className="feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta">
          <div className="cta-inner">
            <div className="cta-box">
              <div className="cta-glow-1" />
              <div className="cta-glow-2" />
              <div className="cta-content">
                <h2 className="cta-title">Ready to test your knowledge?</h2>
                <p className="cta-desc">
                  Join over 10,000 students and professionals who are transforming the way they study. Get started for free today.
                </p>
                <div className="cta-btns">
                  <button className="btn-cta-primary">Create Free Account</button>
                  <button className="btn-cta-outline">Contact Sales</button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

    </div>
  );
}
