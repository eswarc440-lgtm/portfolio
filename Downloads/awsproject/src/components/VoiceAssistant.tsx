/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  CornerDownLeft, 
  MessageSquare, 
  X, 
  Sparkles, 
  ChevronUp, 
  ChevronDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatLogItem {
  id: string;
  sender: 'User' | 'Assistant';
  text: string;
  timestamp: Date;
}

export const VoiceAssistant: React.FC = () => {
  const { 
    disasters, 
    shelters, 
    volunteers, 
    ngos, 
    deliveries, 
    currentUser, 
    setPath,
    getAIRecommendation
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [commandText, setCommandText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [chatLog, setChatLog] = useState<ChatLogItem[]>([
    {
      id: 'welcome',
      sender: 'Assistant',
      text: "Voice operations console initialized. Say 'What is the system status?' or tap the microphone to begin.",
      timestamp: new Date()
    }
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setCommandText(resultText);
        processCommand(resultText);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg("Mic permission denied. Please allow microphone access or type commands.");
        } else {
          setErrorMsg(`Voice Error: ${event.error}. Please retry or type.`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto-scroll chat logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const speakText = (text: string) => {
    if (isMuted) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Cancel ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Attempt to use a clean English/female or male natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const cleanVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural') || v.lang === 'en-US');
    if (cleanVoice) {
      utterance.voice = cleanVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg("Microphone voice recognition is not supported in this environment. Please type your query below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        recognitionRef.current.abort();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (err) {
            setErrorMsg("Mic is currently locked. Please type below or reload.");
          }
        }, 300);
      }
    }
  };

  const addToLog = (sender: 'User' | 'Assistant', text: string) => {
    const newItem: ChatLogItem = {
      id: Math.random().toString(),
      sender,
      text,
      timestamp: new Date()
    };
    setChatLog(prev => [...prev, newItem]);
  };

  const processCommand = async (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    if (!text) return;

    let response = "";

    // Navigation commands
    if (text.includes('go to settings') || text.includes('open settings') || text.includes('show settings')) {
      response = "Navigating to system settings and profile management.";
      setPath('settings');
    } else if (text.includes('go to disasters') || text.includes('open disasters') || text.includes('show disasters')) {
      response = "Opening disaster logs and threat reports.";
      setPath('disasters');
    } else if (text.includes('go to shelters') || text.includes('open shelters') || text.includes('show shelters')) {
      response = "Navigating to regional shelter registry.";
      setPath('shelters');
    } else if (text.includes('go to volunteers') || text.includes('open volunteers') || text.includes('show volunteers')) {
      response = "Opening field responder rosters.";
      setPath('volunteers');
    } else if (text.includes('go to dashboard') || text.includes('open dashboard') || text.includes('show dashboard')) {
      response = "Returning to operations dashboard.";
      setPath('dashboard');
    } 
    // Profile commands
    else if (text.includes('who are you') || text.includes('what is this') || text.includes('your name')) {
      response = "I am the Smart Relief Voice Operations Console. Speak commands like 'check shelter status' or 'go to settings' to coordinate relief.";
    } else if (text.includes('who am i') || text.includes('my profile') || text.includes('my role')) {
      if (currentUser) {
        response = `You are authenticated as ${currentUser.name}, holding the role of ${currentUser.role} within ${currentUser.organization || 'Independent Operations'}.`;
      } else {
        response = "Your credential registry is currently offline. Please check authentication.";
      }
    }
    // Help commands
    else if (text.includes('help') || text.includes('what can i say') || text.includes('commands')) {
      response = "Try saying: 'What is the system status?', 'Check shelter occupancy', 'Show volunteer roster', 'Who am I?', 'Analyze disaster impact', or 'Go to settings'.";
    }
    // AI-powered analysis commands
    else if (text.includes('analyze') || text.includes('recommend') || text.includes('predict') || text.includes('ai') || text.includes('smart')) {
      if (disasters.length > 0) {
        setIsProcessingAI(true);
        try {
          const aiResponse = await getAIRecommendation(disasters[0]);
          if (aiResponse && aiResponse.recommendation) {
            response = aiResponse.recommendation;
          } else {
            response = "AI analysis is currently unavailable. Please check your system configuration.";
          }
        } catch (error) {
          console.error('AI processing error:', error);
          response = "I encountered an error processing your AI request. Please try again.";
        } finally {
          setIsProcessingAI(false);
        }
      } else {
        response = "No active disasters found for AI analysis. Please declare a disaster first.";
      }
    }
    // Quick status commands
    else if (text.includes('disaster') || text.includes('incident') || text.includes('emergency')) {
      const count = disasters.length;
      if (count === 0) {
        response = "There are currently no active disasters registered in the emergency console.";
      } else {
        const titles = disasters.slice(0, 3).map(d => d.title).join(', ');
        response = `There are ${count} active disasters in the system. The critical threats are: ${titles}.`;
      }
    } else if (text.includes('shelter') || text.includes('occupancy') || text.includes('full')) {
      const count = shelters.length;
      const activeCount = shelters.filter(s => s.status === 'Active').length;
      const avgCapacity = Math.round(shelters.reduce((acc, curr) => acc + (curr.occupancy / curr.capacity) * 100, 0) / (count || 1));
      response = `There are ${count} shelters monitored. ${activeCount} are active, with an average regional occupancy density of ${avgCapacity} percent.`;
    } else if (text.includes('volunteer') || text.includes('responder') || text.includes('driver')) {
      const count = volunteers.length;
      const available = volunteers.filter(v => v.availability === 'Available').length;
      response = `We have ${count} field responders registered in the database, with ${available} responders in available status.`;
    } else if (text.includes('ngo') || text.includes('organization') || text.includes('agency')) {
      const count = ngos.length;
      response = `The system maintains coordination links with ${count} registered relief organizations.`;
    } else if (text.includes('delivery') || text.includes('transit') || text.includes('convoy') || text.includes('shipment')) {
      const count = deliveries.length;
      const active = deliveries.filter(d => d.status !== 'Delivered').length;
      response = `There are ${count} historic convoys tracked, with ${active} shipments currently in transit to emergency shelters.`;
    } else if (text.includes('status') || text.includes('summary') || text.includes('system')) {
      const disastersCount = disasters.length;
      const activeShelters = shelters.filter(s => s.status === 'Active').length;
      const activeVolunteers = volunteers.filter(v => v.availability === 'Available').length;
      response = `Emergency status summary. We are monitoring ${disastersCount} incidents. There are ${activeShelters} active shelters and ${activeVolunteers} volunteers ready for dispatch.`;
    } else {
      response = `Command recognized: "${rawText}". Say 'help' to review supported operations.`;
    }

    addToLog('Assistant', response);
    speakText(response);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;
    
    const text = commandText;
    addToLog('User', text);
    setCommandText('');
    
    // Simulate thinking/delay before responding
    setTimeout(() => {
      processCommand(text);
    }, 250);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addToLog('User', suggestion);
    setTimeout(() => {
      processCommand(suggestion);
    }, 250);
  };

  const suggestions = [
    "System status summary",
    "Check shelter occupancy",
    "Who am I?",
    "Go to settings"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Voice Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 md:w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden mb-4 flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-950 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1 bg-rose-600 rounded-md ${isListening ? 'animate-pulse' : ''}`}>
                  <Mic className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Voice Operations Console</h4>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {isListening ? 'LISTENING FOR COMMANDS' : 'VOICE CHAT READY'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  title={isMuted ? "Unmute Assistant voice" : "Mute Assistant voice"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800 text-[10px] px-3.5 py-2 font-semibold flex items-center space-x-1.5">
                <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}

            {/* Chat Display Log */}
            <div className="p-4 flex-1 h-64 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
              {chatLog.map(item => (
                <div
                  key={item.id}
                  className={`flex ${item.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs shadow-sm ${
                      item.sender === 'User'
                        ? 'bg-rose-600 text-white rounded-tr-none font-sans font-medium'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-150 dark:border-slate-600 rounded-tl-none font-sans font-normal leading-relaxed'
                    }`}
                  >
                    <p>{item.text}</p>
                    <span className={`text-[8px] mt-1 block text-right leading-none ${
                      item.sender === 'User' ? 'text-rose-200' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Glowing wave pattern when listening */}
            {isListening && (
              <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 border-y border-rose-100 dark:border-rose-800 flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono text-rose-700 dark:text-rose-400 animate-pulse">
                  SPEAK NOW...
                </span>
                <div className="flex items-center space-x-0.5">
                  <div className="w-1 h-3 bg-rose-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-1 h-5 bg-rose-600 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                  <div className="w-1 h-4 bg-rose-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-6 bg-rose-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <div className="w-1 h-3 bg-rose-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                </div>
              </div>
            )}

            {/* Quick Suggestions Badges */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5 justify-center">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 px-2.5 py-1 rounded-full cursor-pointer transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Command Text Input Area */}
            <form onSubmit={handleTextSubmit} className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-150 dark:border-slate-700 flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 animate-pulse'
                    : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 shadow-sm'
                }`}
                title={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                type="text"
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                placeholder="Ask about disasters, shelters..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-inner"
              />

              <button
                type="submit"
                disabled={!commandText.trim()}
                className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-900 disabled:opacity-50 text-white flex items-center justify-center cursor-pointer shadow"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-rose-600 hover:bg-rose-750 text-white p-3.5 rounded-full shadow-2xl border border-rose-700 cursor-pointer flex items-center justify-center space-x-1.5 focus:outline-none"
      >
        <div className="relative">
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
          <Mic className="h-5 w-5" />
        </div>
        {!isOpen && (
          <span className="text-xs font-bold font-mono tracking-wider uppercase pr-1">
            Voice Assistant
          </span>
        )}
      </motion.button>
    </div>
  );
};
