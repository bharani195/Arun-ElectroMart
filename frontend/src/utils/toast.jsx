import React from 'react';
import { toast as reactToast } from 'react-toastify';

const icons = {
    success: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    error: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM11.25 6.75l-4.5 4.5M6.75 6.75l4.5 4.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    warn: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.725 2.783 1.258 13.5a1.5 1.5 0 0 0 1.275 2.25h12.934a1.5 1.5 0 0 0 1.275-2.25L10.275 2.783a1.5 1.5 0 0 0-2.55 0ZM9 6.75v3M9 12.75h.008" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    info: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM9 6v3M9 12h.008" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

const CloseButton = ({ closeToast }) => (
    <button type="button" aria-label="close" onClick={closeToast} className="custom-toast-close">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="currentColor" fillOpacity=".7" />
            <rect x="12.531" y="13.914" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.531 13.914)" fill="currentColor" fillOpacity=".7" />
        </svg>
    </button>
);

const ToastContent = ({ icon, title, message }) => (
    <div className="custom-toast-body">
        <div className="custom-toast-icon">{icon}</div>
        <div className="custom-toast-text">
            <h3 className="custom-toast-title">{title}</h3>
            {message && <p className="custom-toast-msg">{message}</p>}
        </div>
    </div>
);

const showToast = (type, text) => {
    // If text has a title pattern like "Title: message", split it
    let title = text;
    let message = '';

    reactToast(<ToastContent icon={icons[type]} title={title} message={message} />, {
        className: `custom-toast custom-toast-${type}`,
        closeButton: <CloseButton />,
        progressClassName: `custom-toast-progress-${type}`,
        icon: false,
    });
};

const toast = {
    success: (text) => showToast('success', text),
    error: (text) => showToast('error', text),
    warn: (text) => showToast('warn', text),
    info: (text) => showToast('info', text),
};

export default toast;
