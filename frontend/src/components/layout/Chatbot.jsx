import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiLoader, FiPhone } from 'react-icons/fi';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: '👋 Hi! Welcome to AbhiElectromart. I\'m your shopping assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const sessionIdRef = useRef(`chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

    const quickQuestions = [
        'What products do you sell?',
        'Track my order',
        'Return policy',
        'Contact support'
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Save chat log to database (called after every bot response)
    const saveChatLog = async (allMessages) => {
        const msgs = allMessages || messages;
        const userMsgs = msgs.filter(m => m.type === 'user');
        if (userMsgs.length === 0) return;
        try {
            const headers = { 'Content-Type': 'application/json' };
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const { token } = JSON.parse(userInfo);
                if (token) headers['Authorization'] = `Bearer ${token}`;
            }
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await fetch(`${apiUrl}/chatlog`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    messages: msgs,
                    sessionId: sessionIdRef.current,
                }),
            });
        } catch (err) {
            console.error('Failed to save chat log:', err);
        }
    };

    const handleClose = () => {
        saveChatLog();
        setIsOpen(false);
        // Reset for next session
        setMessages([{ type: 'bot', text: '👋 Hi! Welcome to AbhiElectromart. I\'m your shopping assistant. How can I help you today?' }]);
        sessionIdRef.current = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    };

    // Offline fallback responses when API is unavailable
    const getOfflineResponse = (msg) => {
        const lower = msg.toLowerCase();
        if (lower.includes('product') || lower.includes('sell') || lower.includes('buy') || lower.includes('available'))
            return "🛒 We sell a wide range of electrical & electronic products:\n\n📦 Categories:\n• Electronics – LED bulbs, lighting (Philips LED 9W – ₹149)\n• Switches – Modular switches (Anchor Set – ₹1,299)\n• Power Backup – Inverters, UPS (Luminous 900VA – ₹6,999)\n• Fans – Ceiling & table fans (Crompton – ₹2,499)\n• Wires & Cables – Polycab, Havells, Finolex\n• Water Pumps – Kirloskar 1HP – ₹8,599\n\n🏷️ Brands: Crompton, Polycab, Havells, Finolex, Kirloskar, Anchor, Philips, Luminous\n\nBrowse all at the Products page!";
        if (lower.includes('track') || lower.includes('order') || lower.includes('delivery') || lower.includes('shipping'))
            return "📦 To track your order:\n1. Log in to your account\n2. Go to My Orders section\n3. You'll see real-time status of all orders\n\n🚚 Shipping: Free delivery on orders above ₹500!";
        if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange'))
            return "🔄 Return Policy:\n• 7-day easy returns\n• Items must be unused & in original packaging\n• Refund processed within 5-7 business days\n\nContact us at arunum.24mca@kongu.edu for return requests.";
        if (lower.includes('contact') || lower.includes('support') || lower.includes('help') || lower.includes('phone') || lower.includes('email'))
            return "📞 Contact Us:\n• Email: arunum.24mca@kongu.edu\n• Phone: +91 6379777230\n• Address: Kavindapadi, Erode – 638455\n• Hours: 9 AM – 6 PM (Mon-Sat)\n\nWe're happy to help! 😊";
        if (lower.includes('warranty') || lower.includes('guarantee'))
            return "🛡️ Warranty:\n• 1-2 years manufacturer warranty on most products\n• Warranty card included with every purchase\n• Contact the brand's service center for claims";
        if (lower.includes('payment') || lower.includes('pay') || lower.includes('cod') || lower.includes('cash'))
            return "💳 Payment Options:\n• Cash on Delivery (COD) ✅\n• Online payment coming soon!\n\nNo extra charges for COD orders.";
        if (lower.includes('price') || lower.includes('cost') || lower.includes('cheap') || lower.includes('discount') || lower.includes('offer'))
            return "💰 We offer competitive prices!\n• LED Bulbs from ₹149\n• Ceiling Fans from ₹2,499\n• Wires from ₹1,899\n• Free shipping on orders above ₹500\n\nCheck our Products at Low Cost section for the best deals!";
        if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey'))
            return "👋 Hello! Welcome to AbhiElectromart! I'm ElectroBot, your shopping assistant.\n\nI can help you with:\n• 🛒 Product information\n• 📦 Order tracking\n• 🔄 Return policy\n• 📞 Contact details\n\nWhat would you like to know?";
        return "Thank you for your message! I can help you with:\n\n• 🛒 Products – What we sell, prices, brands\n• 📦 Orders – Track your delivery\n• 🔄 Returns – Return policy & refunds\n• 📞 Contact – Reach our team\n• 💳 Payment – Payment options\n\nPlease ask about any of these topics! 😊";
    };

    const getAIResponse = async (userMessage) => {
        const systemPrompt = `You are ElectroBot, the official AI assistant for AbhiElectromart - an electronics and electrical products e-commerce store.

IMPORTANT RULES:
1. You MUST ONLY answer questions related to AbhiElectromart and its products/services.
2. If someone asks about anything NOT related to AbhiElectromart (like general knowledge, other websites, coding, politics, news, entertainment, sports, etc.), politely decline and redirect them to ask about our store.
3. For unrelated questions, respond with: "I'm sorry, I can only help with questions about AbhiElectromart, our products, orders, and services. Is there anything about our store I can help you with?"
4. Never provide information about competitors or other e-commerce sites.
5. Keep responses concise and focused on our store only.

ABHIELECTROMART INFORMATION:

📦 PRODUCT CATEGORIES:
1. Electronics - LED bulbs, lighting products (Philips LED Bulb 9W - ₹149)
2. Switches & Accessories - Modular switches (Anchor Switches Set - ₹1,299)
3. Power Backup & Power Supply - Inverters, UPS (Luminous Inverter 900VA - ₹6,999)
4. Fans - Ceiling fans, table fans (Crompton Ceiling Fan - ₹2,499)
5. Wires & Cables - Electrical wires (Polycab 2.5 sq mm - ₹2,499, Havells 1.5 sq mm - ₹1,899, Finolex 3 Core - ₹3,299)
6. Water Pumps & Motors - Submersible pumps (Kirloskar 1HP - ₹8,599, Crompton 0.5HP - ₹4,599)

🏷️ BRANDS WE CARRY:
Crompton, Polycab, Havells, Finolex, Kirloskar, Anchor, Philips, Luminous

📋 STORE POLICIES:
- Return Policy: 7-day easy returns, items must be unused and in original packaging
- Warranty: 1-2 years manufacturer warranty on most products
- Shipping: Free shipping on orders above ₹500
- Payment: COD available, Online payment coming soon

📞 CONTACT INFORMATION:
- Email: arunum.24mca@kongu.edu
- Phone: +91 6379777230
- Address: Kavindapadi, Erode - 638455
- Hours: 9 AM - 6 PM (Mon-Sat)

🛒 WEBSITE FEATURES:
- Browse products by category
- Search for specific products
- Add items to cart
- Track your orders in "My Orders" section
- Create an account for faster checkout

Remember: ONLY answer questions about AbhiElectromart. Do NOT provide information about anything else.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AbhiElectromart Chatbot'
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.2-3b-instruct:free',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.slice(-4).map(msg => ({
                            role: msg.type === 'user' ? 'user' : 'assistant',
                            content: msg.text
                        })),
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 150,
                    temperature: 0.5
                })
            });

            if (!response.ok) {
                return getOfflineResponse(userMessage);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || getOfflineResponse(userMessage);
        } catch (error) {
            return getOfflineResponse(userMessage);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { type: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await getAIResponse(currentInput);
            const botMessage = { type: 'bot', text: response };
            const allMessages = [...newMessages, botMessage];
            setMessages(allMessages);
            // Save to database after every exchange
            saveChatLog(allMessages);
        } catch (error) {
            const errMsg = { type: 'bot', text: "🔧 Sorry, I couldn't process your request. Please try again!" };
            const allMessages = [...newMessages, errMsg];
            setMessages(allMessages);
            saveChatLog(allMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = async (question) => {
        if (isLoading) return;

        const userMessage = { type: 'user', text: question };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await getAIResponse(question);
            const botMessage = { type: 'bot', text: response };
            const allMessages = [...newMessages, botMessage];
            setMessages(allMessages);
            // Save to database after every exchange
            saveChatLog(allMessages);
        } catch (error) {
            const errMsg = { type: 'bot', text: "🔧 Sorry, I couldn't process your request. Please try again!" };
            const allMessages = [...newMessages, errMsg];
            setMessages(allMessages);
            saveChatLog(allMessages);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-widget">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🤖
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: '2px' }}>ElectroBot</h4>
                            <p style={{ fontSize: 'var(--text-xs)', opacity: 0.8 }}>
                                {isLoading ? '✨ Thinking...' : '🟢 Online'}
                            </p>
                        </div>
                        <a
                            href="tel:+916379777230"
                            className="call-store-btn"
                            title="Call Store"
                            style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.3)';
                            }}
                        >
                            <FiPhone size={18} />
                        </a>
                        <button className="chatbot-close" onClick={handleClose}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div style={{
                        flex: 1,
                        padding: 'var(--space-4)',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-3)'
                    }}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderRadius: msg.type === 'user'
                                        ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)'
                                        : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                                    background: msg.type === 'user' ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                                    border: msg.type === 'user' ? 'none' : '1px solid var(--border-glass)',
                                    color: msg.type === 'user' ? 'white' : 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                    whiteSpace: 'pre-line',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{
                                alignSelf: 'flex-start',
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--border-glass)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)'
                            }}>
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    <div style={{
                        padding: 'var(--space-3)',
                        borderTop: '1px solid var(--border-glass)',
                        display: 'flex',
                        gap: 'var(--space-2)',
                        flexWrap: 'wrap'
                    }}>
                        {quickQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickQuestion(q)}
                                disabled={isLoading}
                                style={{
                                    padding: 'var(--space-2) var(--space-3)',
                                    background: 'var(--bg-glass)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: 'var(--radius-full)',
                                    color: 'var(--text-secondary)',
                                    fontSize: 'var(--text-xs)',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'var(--transition-fast)',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: 'var(--space-4)',
                        borderTop: '1px solid var(--border-glass)',
                        display: 'flex',
                        gap: 'var(--space-2)'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isLoading ? "ElectroBot is typing..." : "Ask about our products..."}
                            className="form-input"
                            style={{ flex: 1 }}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            className="btn btn-primary"
                            style={{ padding: 'var(--space-3)' }}
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? (
                                <FiLoader size={18} className="spin" />
                            ) : (
                                <FiSend size={18} />
                            )}
                        </button>
                    </div>
                </div>
            )}

            <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
            </button>

            <style>{`
                .typing-indicator {
                    display: flex;
                    gap: 4px;
                }
                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: var(--brand-primary);
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }
                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-10px);
                        opacity: 1;
                    }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Chatbot;
