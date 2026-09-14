import React, { useState, useEffect } from 'react';

export default function CloudServices() {
  // State variables for View Counter and AI Chatbot
  const [views, setViews] = useState<number | string>("Loading...");
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'ai', text: string}[]>([
    { sender: 'ai', text: 'Hi! I am your AI assistant powered by Amazon Bedrock & Nova. Ask me anything about this cloud architecture!' }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Endpoint URLs - Replace with your actual AWS API endpoints
  const VIEW_COUNTER_API = "https://amazonaws.com";
  const CHATBOT_API = "https://amazonaws.com";

  // Fetch real-time views from DynamoDB via Lambda on mount
  useEffect(() => {
    fetch(VIEW_COUNTER_API)
      .then(res => res.json())
      .then(data => setViews(data.views))
      .catch(err => {
        console.error("Error fetching views:", err);
        setViews("Error");
      });
  }, []);

  // Send query to Amazon Bedrock & Nova
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(CHATBOT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      
      setChatHistory(prev => [...prev, { sender: 'ai', text: data.reply || "No response received." }]);
    } catch (err) {
      console.error("Chatbot Error:", err);
      setChatHistory(prev => [...prev, { sender: 'ai', text: "Failed to connect to the Amazon Nova model backend." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="font-sans">
      {/* --- VIEW COUNTER BADGE --- */}
      <div className="fixed top-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md z-50 border border-slate-700 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        AWS DynamoDB Cloud Views: <span className="text-emerald-400 font-bold">{views}</span>
      </div>

      {/* --- FLOATING AI CHAT WIDGET --- */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Toggle Button */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl transition-all flex items-center justify-center font-bold text-lg"
        >
          {chatOpen ? "✕" : "💬 Ask my AI"}
        </button>

        {/* Chat Window Box */}
        {chatOpen && (
          <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-sm flex justify-between items-center">
              <span>Amazon Nova Assistant</span>
              <span className="text-xs bg-blue-500 px-2 py-0.5 rounded text-blue-100">Live Backend</span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl leading-relaxed ${
                    chat.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-slate-400 text-xs italic animate-pulse pl-1">Nova is typing...</div>
              )}
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 flex gap-1 bg-slate-50">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 bg-white"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
                disabled={isTyping}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}