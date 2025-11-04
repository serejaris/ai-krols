'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';

const ChatBot = ({ rabbitId, fullPage = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          rabbitId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🐰 Oops! Something went wrong. Please try again!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Full page mode - render chat box directly without toggle
  if (fullPage) {
    return (
      <div className={styles.chatBoxFullPage}>
        <div className={styles.messagesContainer}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <p>👋 Hi! I'm Rabbit #{rabbitId}!</p>
              <p>Ask me anything!</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${styles[msg.role]}`}
            >
              <div className={styles.messageContent}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.messageContent}>
                <span className={styles.typing}>Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    );
  }

  // Floating mode - original behavior with toggle button
  return (
    <div className={styles.chatContainer}>
      <button
        className={styles.chatToggle}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close chat' : 'Chat with this rabbit'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            <span>🐰 Chat with Rabbit #{rabbitId}</span>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <p>👋 Hi! I'm Rabbit #{rabbitId}!</p>
                <p>Ask me anything!</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${styles[msg.role]}`}
              >
                <div className={styles.messageContent}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageContent}>
                  <span className={styles.typing}>Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className={styles.input}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
