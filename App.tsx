import React, { useState, useEffect, useRef } from 'react';
import { UrlConfig } from './components/UrlConfig';
import { ChatBubble } from './components/ChatBubble';
import { sendMessageToGemini } from './services/geminiService';
import { Message, Sender } from './types';

// Add declaration for SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false); // State for voice input
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // Ref for SpeechRecognition instance

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: 'Hello! I am UrlGenie. Please enter a URL in the sidebar to get started, and I will answer questions based on that website.',
          sender: Sender.Bot,
          timestamp: new Date(),
        },
      ]);
      // Open sidebar on mobile initially to prompt URL entry
      if (window.innerWidth < 768) {
        setIsSidebarOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voice Input Logic
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try using Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput(prev => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${transcript}` : transcript;
        });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    if (!currentUrl) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: input,
          sender: Sender.User,
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          text: "Please set a target URL in the sidebar first so I know what to talk about!",
          sender: Sender.Bot,
          timestamp: new Date()
        }
      ]);
      setInput('');
      setIsSidebarOpen(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.User,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(messages, userMessage.text, currentUrl);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: Sender.Bot,
        timestamp: new Date(),
        sources: response.sources
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setCurrentUrl(url);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Context set to: ${url}. What would you like to know?`,
        sender: Sender.Bot,
        timestamp: new Date(),
      },
    ]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleClearUrl = () => {
    setCurrentUrl('');
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Context cleared. Please enter a new URL.`,
        sender: Sender.Bot,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <UrlConfig 
        currentUrl={currentUrl} 
        onUrlChange={handleUrlChange} 
        onClear={handleClearUrl}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
            <span className="font-bold text-gray-800">UrlGenie</span>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <i className="fa fa-bars"></i>
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start w-full mb-6 animate-pulse">
                 <div className="flex items-end gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">
                       <i className="fa fa-robot"></i>
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="max-w-3xl mx-auto">
            {currentUrl && (
                <div className="mb-2 text-xs text-gray-400 flex items-center gap-1 px-1">
                    <i className="fa fa-link"></i>
                    <span className="truncate max-w-full">Chatting about: {currentUrl}</span>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="relative flex items-center shadow-lg rounded-full bg-gray-50 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentUrl ? "Ask something about the website..." : "Enter a URL in the sidebar first..."}
                className="flex-1 bg-transparent border-none focus:ring-0 pl-6 pr-28 py-4 text-gray-800 placeholder-gray-400 text-sm md:text-base rounded-full"
                disabled={isLoading}
              />
              
              <div className="absolute right-2 flex items-center gap-1">
                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse shadow-md" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Voice Input"
                >
                   <i className={`fa ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-sm"
                >
                  <i className="fa fa-paper-plane text-sm"></i>
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              AI can make mistakes. Verify information from the source.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;