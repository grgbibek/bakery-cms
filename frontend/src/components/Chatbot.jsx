import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';

const Chatbot = ({ phone = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! 👋 Welcome to German Bakery. How can I assist you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Clean the phone number for WhatsApp link formatting
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '15559876543';
  const waLink = `https://wa.me/${cleanPhone}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: inputText }]);
    const currentText = inputText;
    setInputText('');

    // Simulate bot thinking and responding with a WhatsApp redirection prompt
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Thanks for reaching out! To give you the best live support and answers, let\'s seamlessly continue this on WhatsApp.',
        isAction: true,
        userQuery: currentText
      }]);
    }, 1000);
  };

  const openWhatsApp = (query = '') => {
    const textMsg = encodeURIComponent(query ? `Hi, I am reaching out from the website regarding: ${query}` : `Hi, I have a quick question!`);
    window.open(`${waLink}?text=${textMsg}`, '_blank');
  };

  // Catchy color for the chatbot
  const accentColor = '#f43f5e'; // Vibrant Rose
  const glowColor = 'rgba(244, 63, 94, 0.5)';

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              background: 'white',
              width: '350px',
              height: '450px',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(244, 63, 94, 0.1)'
            }}
          >
            {/* Chatbot Header */}
            <div style={{ background: accentColor, color: 'white', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>Bakery Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#fff9f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, index) => (
                <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: msg.sender === 'user' ? accentColor : 'white',
                      color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                      padding: '0.8rem 1.2rem',
                      borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '0.95rem',
                      lineHeight: '1.4'
                    }}
                  >
                    {msg.text}
                  </motion.div>

                  {msg.isAction && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openWhatsApp(msg.userQuery)}
                      style={{
                        marginTop: '0.8rem', background: '#25D366', color: 'white', padding: '1rem',
                        borderRadius: '16px', border: 'none', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '0.6rem', width: '100%', fontWeight: 700, fontSize: '0.95rem',
                        boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)'
                      }}
                    >
                      <MessageCircle size={20} /> Chat on WhatsApp
                    </motion.button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ borderTop: '1px solid rgba(244, 63, 94, 0.1)', padding: '1.2rem', background: 'white', display: 'flex', gap: '0.8rem' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="How can we help?"
                style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '50px', border: '1px solid #f3f0eb', outline: 'none', background: '#fcfafa', fontSize: '0.95rem' }}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: inputText.trim() ? accentColor : '#f3f0eb', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'default', transition: 'all 0.3s', boxShadow: inputText.trim() ? `0 4px 12px ${glowColor}` : 'none' }}
              >
                <Send size={20} style={{ marginLeft: '-2px' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{
          scale: 1.1,
          boxShadow: [
            `0 0 0 0 ${glowColor}`,
            `0 0 0 20px rgba(244, 63, 94, 0)`
          ],
        }}
        transition={{
          boxShadow: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '65px', height: '65px', borderRadius: '50%',
          background: accentColor, color: 'white', border: 'none',
          cursor: 'pointer', boxShadow: `0 12px 24px ${glowColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}
      >
        {isOpen ? <X size={30} /> : <MessageCircle size={30} />}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: 0, right: 0, width: '15px', height: '15px',
              background: '#22c55e', borderRadius: '50%', border: '3px solid white'
            }}
          />
        )}
      </motion.button>

    </div>
  );
};

export default Chatbot;
