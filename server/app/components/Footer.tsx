export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <span className="footer-logo-text">QuizAI</span>
          </div>
          <nav className="footer-nav">
            {["Privacy Policy", "Terms of Service", "Contact Support", "Cookies"].map((item) => (
              <a key={item} href="#">{item}</a>
            ))}
          </nav>
          <div className="footer-socials">
            {["share", "mail"].map((icon) => (
              <a key={icon} href="#" className="social-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 QuizAI Platform. Built with passion for better education.</p>
        </div>
      </div>
    </footer>
  );
}
