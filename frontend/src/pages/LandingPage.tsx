import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../pages/LandingPage.css';

/**
 * Enhanced Landing page component for Sonore
 * Features animated elements, hero section, and improved visual design
 */
function Landing() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Featured content for carousel
    const features = [
        { title: "Discover new artists", icon: "🎵" },
        { title: "Create custom playlists", icon: "📀" },
        { title: "Listen anywhere", icon: "🎧" }
    ];

    // Simulate loading and trigger animations
    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300);

        // Auto rotate carousel
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % features.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`landing-container ${isLoaded ? 'loaded' : ''}`}>
            <div className="background-circles">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
            </div>

            <div className="content-wrapper">
                <div className="hero-section">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <span className="pulse"></span>
                            <span className="note">♪</span>
                        </div>
                    </div>

                    <h1 className="title">Welcome to <span className="highlight">Sonore</span></h1>
                    <p className="subtitle">Your music streaming journey starts here!</p>

                    <div className="feature-carousel">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`feature-item ${currentSlide === index ? 'active' : ''}`}
                            >
                                <span className="feature-icon">{feature.icon}</span>
                                <span className="feature-text">{feature.title}</span>
                            </div>
                        ))}

                        <div className="carousel-dots">
                            {features.map((_, index) => (
                                <span
                                    key={index}
                                    className={`dot ${currentSlide === index ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                ></span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="auth-section">
                    <div className="button-group">
                        <Link to="/login">
                            <button className="btn login-btn">
                                <span className="btn-icon">👤</span>
                                <span className="btn-text">Login</span>
                            </button>
                        </Link>
                        <Link to="/register">
                            <button className="btn register-btn">
                                <span className="btn-icon">✨</span>
                                <span className="btn-text">Register</span>
                            </button>
                        </Link>
                    </div>
                </div>


            </div>
        </div>
    );
}

export default Landing;
