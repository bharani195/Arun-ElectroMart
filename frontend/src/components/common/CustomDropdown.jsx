import React, { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ label, value, onChange, options, disabled = false, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt =>
        (typeof opt === 'object' ? opt.value : opt) === value
    );

    const displayText = selectedOption
        ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
        : 'Select...';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`cdd-wrapper ${className}`} ref={dropdownRef}>
            {label && <p className="cdd-label">{label}</p>}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`cdd-trigger ${disabled ? 'cdd-disabled' : ''} ${isOpen ? 'cdd-open' : ''}`}
                disabled={disabled}
            >
                <span className="cdd-selected-text">{displayText}</span>
                <svg className={`cdd-chevron ${isOpen ? 'cdd-chevron-flip' : ''}`} width="11" height="17" viewBox="0 0 11 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.92546 6L5.68538 1L1.44531 6" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.44564 11L5.68571 16L9.92578 11" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isOpen && (
                <ul className="cdd-menu">
                    {options.map((opt) => {
                        const optValue = typeof opt === 'object' ? opt.value : opt;
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        const isActive = optValue === value;
                        return (
                            <li
                                key={optValue}
                                className={`cdd-item ${isActive ? 'cdd-item-active' : ''}`}
                                onClick={() => handleSelect(opt)}
                            >
                                <span>{optLabel}</span>
                                {isActive && (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default CustomDropdown;
