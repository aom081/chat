import React, { useState } from 'react';

const Chat = () => {
 const [messages, setMessages] = useState([]);

 const handleNewMessage = (message) => {
    setMessages([...messages, message]);
 };

 return (
    <div className="chat-container">
      <h1>MernChat</h1>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <span className="sender">{message.sender}:</span>
            <span className="content">{message.content}</span>
          </div>
        ))}
      </div>
      <MessageForm onNewMessage={handleNewMessage} />
    </div>
 );
};

const MessageForm = ({ onNewMessage }) => {
 const [content, setContent] = useState('');

 const handleChange = (event) => {
    setContent(event.target.value);
 };

 const handleSubmit = (event) => {
    event.preventDefault();
    onNewMessage({
      sender: 'You',
      content: content,
    });
    setContent('');
 };

 return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={content}
        onChange={handleChange}
        placeholder="Type your message here"
      />
      <button type="submit">Send</button>
    </form>
 );
};

export default Chat;