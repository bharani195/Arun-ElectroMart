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
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&h=600&fit=crop',
            cta: 'Shop Now',
            ctaLink: '/products'
        },
        {
            id: 2,
            title: 'Smart Home Technology',
            subtitle: 'Innovation at Your Fingertips',
            description: 'Transform your space with intelligent electrical solutions',
            image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1920&h=600&fit=crop',
            cta: 'Explore',
            ctaLink: '/products?filter=featured'
        },
        {
            id: 3,
            title: 'Industrial Grade Equipment',
            subtitle: 'Built to Last',
            description: 'Professional-grade electrical equipment for demanding applications',
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=600&fit=crop',
            cta: 'View Products',
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
                            background: 'linear-gradient(135deg, #8b7355 0%, #6b5d4f 50%, #5a4a3a 100%)'
                        }}
                    >
                        <div className="carousel-content container">
                            <div className="carousel-text animate-fade-in-up">
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
