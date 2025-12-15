'use client';

import Script from 'next/script'

export default function AIFirstLandingPage() {
  return (
    <>
      <link rel="stylesheet" href="/landing-styles.css" />
      
      {/* Navigation */}
      <nav className="navbar" id="navbar">
        <div className="nav-container">
          <a href="#" className="logo">
            <span className="logo-icon">🏓</span>
            <span className="logo-text">Mindful Champion</span>
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#benefits">Benefits</a>
            <a href="#community">Community</a>
            <a href="/auth/signin" className="btn btn-outline">Sign In</a>
            <a href="/auth/signin" className="btn btn-primary">Get Started Free</a>
          </div>
          <button className="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobileMenu">
        <a href="#features">Features</a>
        <a href="#benefits">Benefits</a>
        <a href="#community">Community</a>
        <a href="/auth/signin" className="btn btn-outline">Sign In</a>
        <a href="/auth/signin" className="btn btn-primary">Get Started Free</a>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://cdn.abacus.ai/images/3a346a49-8a70-4e0b-a66a-76b0096c53a1.png" alt="Pickleball action" className="hero-bg-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">🎾 #1 AI Pickleball Platform</div>
          <h1 className="hero-title animate-fade-in-up">
            Transform Your <span className="gradient-text">Pickleball Game</span> with AI
          </h1>
          <p className="hero-subtitle animate-fade-in-up delay-1">
            Meet Coach Kai, your personal AI coach. Get real-time feedback, track tournaments, 
            analyze your technique, and join a thriving community of players.
          </p>
          <div className="hero-cta animate-fade-in-up delay-2">
            <a href="/auth/signin" className="btn btn-primary btn-large">
              <span>Start Training Free</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#features" className="btn btn-secondary btn-large">
              <span>Explore Features</span>
            </a>
          </div>
          <div className="hero-stats animate-fade-in-up delay-3">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Players</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Tournaments</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">User Rating</span>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Video Carousel Section */}
      <section className="video-section" id="videos">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">🎬 Featured Content</span>
            <h2 className="section-title">Watch & Learn</h2>
            <p className="section-subtitle">Curated pickleball content to elevate your game</p>
          </div>
          <div className="video-carousel">
            <button className="carousel-btn prev" id="prevBtn" aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="carousel-track" id="carouselTrack">
              <div className="video-card">
                <div className="video-thumbnail">
                  <iframe src="https://www.youtube.com/embed/fTb3rGRxJK8" title="Pro Pickleball Tips" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <h3>Pro Tips for Beginners</h3>
                <p>Master the basics with expert guidance</p>
              </div>
              <div className="video-card">
                <div className="video-thumbnail">
                  <iframe src="https://www.youtube.com/embed/Z8chbsEI5aE" title="Pickleball Strategy" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <h3>Advanced Strategy</h3>
                <p>Dominate the court with smart plays</p>
              </div>
              <div className="video-card">
                <div className="video-thumbnail">
                  <iframe src="https://www.youtube.com/embed/FXxgv0Y-3JI" title="Pickleball Tournament" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <h3>Tournament Highlights</h3>
                <p>See the pros in action</p>
              </div>
              <div className="video-card">
                <div className="video-thumbnail">
                  <iframe src="https://www.youtube.com/embed/Uy1FL-NhM-o" title="Pickleball Drills" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <h3>Essential Drills</h3>
                <p>Practice routines that work</p>
              </div>
            </div>
            <button className="carousel-btn next" id="nextBtn" aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div className="carousel-dots" id="carouselDots"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">✨ Powerful Features</span>
            <h2 className="section-title">Everything You Need to Excel</h2>
            <p className="section-subtitle">From AI coaching to live tournaments, we've got you covered</p>
          </div>
          <div className="features-grid">
            <div className="feature-card featured" data-animate>
              <div className="feature-icon-wrap">
                <img src="https://cdn.abacus.ai/images/fbd1597d-22ad-4a74-91ac-448008fd2dc0.png" alt="Coach Kai AI" className="feature-image" />
              </div>
              <div className="feature-badge">AI Powered</div>
              <h3>Meet Coach Kai</h3>
              <p>Your personal AI pickleball coach available 24/7. Get instant feedback on technique, personalized training plans, and real-time game analysis.</p>
              <ul className="feature-list">
                <li>✓ Real-time technique analysis</li>
                <li>✓ Custom training plans</li>
                <li>✓ Voice-guided coaching</li>
              </ul>
              <a href="/auth/signin" className="feature-link">Try Coach Kai →</a>
            </div>
            <div className="feature-card" data-animate>
              <div className="feature-icon">
                <img src="https://cdn.abacus.ai/images/db075ffb-1c67-48e6-bd57-138a5bd33070.png" alt="Tournament Hub" className="feature-thumb" />
              </div>
              <h3>Tournament Hub</h3>
              <p>Never miss a match! Live brackets, schedules, stream links, and real-time score updates from tournaments nationwide.</p>
              <a href="/dashboard" className="feature-link">View Tournaments →</a>
            </div>
            <div className="feature-card" data-animate>
              <div className="feature-icon">
                <img src="https://cdn.abacus.ai/images/a3c547fd-5153-42c2-9b81-ac03c4680d93.png" alt="Training Tools" className="feature-thumb" />
              </div>
              <h3>Training Tools</h3>
              <p>Upload your game videos for AI analysis. Track progress, identify weaknesses, and get drills tailored to your skill level.</p>
              <a href="/auth/signin" className="feature-link">Start Training →</a>
            </div>
            <div className="feature-card" data-animate>
              <div className="feature-icon">
                <img src="https://cdn.abacus.ai/images/38e1875b-2349-4819-a05b-e7d4414106ad.png" alt="Mental Training" className="feature-thumb" />
              </div>
              <h3>Mental Training</h3>
              <p>Master the mental game. Guided mindfulness, pre-match routines, and visualization exercises to stay calm under pressure.</p>
              <a href="/auth/signin" className="feature-link">Build Focus →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits/Transformation Section */}
      <section className="benefits-section" id="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <span className="section-tag">🚀 Your Transformation</span>
              <h2 className="section-title">From Beginner to Champion</h2>
              <p className="benefits-intro">
                Whether you're picking up a paddle for the first time or competing at tournaments, 
                Mindful Champion adapts to your level and helps you reach new heights.
              </p>
              <div className="benefit-items">
                <div className="benefit-item" data-animate>
                  <div className="benefit-number">01</div>
                  <div className="benefit-content">
                    <h4>Improve Faster</h4>
                    <p>AI-powered analysis spots mistakes humans miss. Players improve 3x faster with personalized feedback.</p>
                  </div>
                </div>
                <div className="benefit-item" data-animate>
                  <div className="benefit-number">02</div>
                  <div className="benefit-content">
                    <h4>Stay Consistent</h4>
                    <p>Track your progress, set goals, and maintain momentum with smart reminders and achievements.</p>
                  </div>
                </div>
                <div className="benefit-item" data-animate>
                  <div className="benefit-number">03</div>
                  <div className="benefit-content">
                    <h4>Play Smarter</h4>
                    <p>Learn when to dink, when to drive, and how to outthink opponents with strategic insights.</p>
                  </div>
                </div>
                <div className="benefit-item" data-animate>
                  <div className="benefit-number">04</div>
                  <div className="benefit-content">
                    <h4>Win More</h4>
                    <p>Mental training + physical skills = complete player. Dominate under pressure.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="benefits-visual">
              <div className="progress-chart">
                <div className="chart-bar" data-value="25">
                  <span className="bar-fill"></span>
                  <span className="bar-label">Week 1</span>
                </div>
                <div className="chart-bar" data-value="45">
                  <span className="bar-fill"></span>
                  <span className="bar-label">Week 4</span>
                </div>
                <div className="chart-bar" data-value="65">
                  <span className="bar-fill"></span>
                  <span className="bar-label">Week 8</span>
                </div>
                <div className="chart-bar" data-value="90">
                  <span className="bar-fill"></span>
                  <span className="bar-label">Week 12</span>
                </div>
                <div className="chart-label">Skill Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community/Testimonials Section */}
      <section className="community-section" id="community">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">💬 Community Love</span>
            <h2 className="section-title">Join Thousands of Happy Players</h2>
            <p className="section-subtitle">Real stories from our pickleball community</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card" data-animate>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&quot;Coach Kai helped me fix my backhand in just 2 weeks! The video analysis is incredible - it catches things I never noticed.&quot;</p>
              <div className="testimonial-author">
                <div className="author-avatar">MJ</div>
                <div className="author-info">
                  <span className="author-name">Mike J.</span>
                  <span className="author-level">3.5 → 4.0 Player</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card" data-animate>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&quot;The Tournament Hub is a game-changer. I never miss a match now, and the live stream links are super convenient.&quot;</p>
              <div className="testimonial-author">
                <div className="author-avatar">SR</div>
                <div className="author-info">
                  <span className="author-name">Sarah R.</span>
                  <span className="author-level">Tournament Player</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card" data-animate>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&quot;The mental training section helped me stay calm during my first tournament. I actually won my bracket! Highly recommend.&quot;</p>
              <div className="testimonial-author">
                <div className="author-avatar">DL</div>
                <div className="author-info">
                  <span className="author-name">David L.</span>
                  <span className="author-level">Beginner → Competitor</span>
                </div>
              </div>
            </div>
          </div>
          <div className="community-image">
            <img src="https://cdn.abacus.ai/images/275c11d5-bd35-49b6-822d-12b8ec3181d9.png" alt="Pickleball Community" className="community-photo" />
            <div className="community-overlay">
              <span className="community-stat">Join 10,000+ players in our growing community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Elevate Your Game?</h2>
            <p className="cta-subtitle">Start your free trial today. No credit card required.</p>
            <div className="cta-buttons">
              <a href="/auth/signin" className="btn btn-primary btn-large">
                <span>Get Started Free</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
            <p className="cta-note">✓ Free 7-day trial &nbsp; ✓ Cancel anytime &nbsp; ✓ Full feature access</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <a href="#" className="logo">
                <span className="logo-icon">🏓</span>
                <span className="logo-text">Mindful Champion</span>
              </a>
              <p>Your AI-powered journey to pickleball excellence.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <a href="/dashboard">Tournament Hub</a>
                <a href="/auth/signin">Coach Kai</a>
                <a href="/auth/signin">Training</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Contact</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Mindful Champion. All rights reserved.</p>
            <div className="partner-note">
              <span>Proud partners with leading pickleball organizations</span>
            </div>
          </div>
        </div>
      </footer>

      <Script src="/landing-script.js" strategy="afterInteractive" />
    </>
  );
}
