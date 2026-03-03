import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './HeroCarousel.css';

const HeroCarousel = ({ slides = [] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Default slides if none provided
    const defaultSlides = [
        {
            id: 1,
            title: 'Premium Electrical Solutions',
            subtitle: 'Power Your World',
            description: 'Discover cutting-edge electrical products for your home and business',
            image: '/images/hero/hero1.jpg',
            cta: 'Shop Now',
            ctaLink: '/products'
        },
        {
            id: 2,
            title: 'Professional Grade Components',
            subtitle: 'Reliability in Every Connection',
            description: 'High-quality circuit breakers, wires, and switches for demanding environments',
            image: '/images/hero/hero2.jpg',
            cta: 'Browse Catalog',
            ctaLink: '/products'
        },
        {
            id: 3,
            title: 'Smart Home Innovation',
            subtitle: 'The Future is Intelligent',
            description: 'Transform your space with advanced energy management and automation solutions',
            image: '/images/hero/hero3.jpg',
            cta: 'Explore Smart Tech',
            ctaLink: '/products'
        }
    ];

    const carouselSlides = slides.length > 0 ? slides : defaultSlides;

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, carouselSlides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <div className="hero-carousel">
            <div className="carousel-container">
                {carouselSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{
                            backgroundImage: `url("${slide.image}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="carousel-content container">
                            <div className="carousel-text animate-fade-in-up" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                <p className="carousel-subtitle">{slide.subtitle}</p>
                                <h1 className="carousel-title">{slide.title}</h1>
                                <p className="carousel-description">{slide.description}</p>
                                <a href={slide.ctaLink} className="btn-primary-modern btn-modern">
                                    {slide.cta}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                className="carousel-arrow carousel-arrow-left"
                onClick={prevSlide}
                aria-label="Previous slide"
            >
                <FiChevronLeft size={32} />
            </button>
            <button
                className="carousel-arrow carousel-arrow-right"
                onClick={nextSlide}
                aria-label="Next slide"
            >
                <FiChevronRight size={32} />
            </button>

            {/* Dots Navigation */}
            <div className="carousel-dots">
                {carouselSlides.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
