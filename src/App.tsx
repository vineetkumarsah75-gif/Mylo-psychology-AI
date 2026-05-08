/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, User, BrainCircuit, Heart, Info, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getMyloResponse } from "./services/geminiService";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "model",
      content: "Namaste! Main Mylo hoon. Aaj aap kaisa mahsoos kar rahe hain? Mere saath share karein, main yahan aapki baat sunne ke liye hoon. 😊",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const response = await getMyloResponse(userMessage.content, history);

    const modelMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "model",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        role: "model",
        content: "Naye sire se shuru karte hain. Aaj aap kaisa mahsoos kar rahe hain? Sab theek hain na?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-mylo-bg shadow-sm sm:border-x border-gray-200">
      {/* Header */}
      <header className="p-4 bg-mylo-card border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-3">
          <div className="bg-mylo-accent/10 p-2 rounded-2xl">
            <Heart className="w-6 h-6 text-mylo-accent" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-mylo-text leading-tight">Mylo</h1>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] uppercase tracking-widest text-mylo-muted font-medium">Psychology Expert</p>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-mylo-muted hover:text-mylo-accent hover:bg-mylo-accent/5 rounded-full transition-colors"
          title="Clear Chat"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        <div className="text-center py-8 opacity-40">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-mylo-accent" />
          <p className="font-serif italic text-sm">Har baat dil khol kar kahein...</p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                  message.role === "user" ? "bg-mylo-accent/10 text-mylo-accent" : "bg-white border border-gray-100 text-mylo-accent"
                }`}>
                  {message.role === "user" ? <User className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                </div>
                
                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    message.role === "user"
                      ? "bg-mylo-accent text-white font-medium shadow-mylo-accent/20"
                      : "bg-mylo-card border border-gray-100 text-mylo-text shadow-sm"
                  }`}
                >
                  <div className="markdown-body text-sm leading-relaxed">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <p className={`text-[10px] mt-2 ${
                    message.role === "user" ? "text-white/60" : "text-mylo-muted"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-mylo-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-mylo-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-mylo-accent rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-gray-100">
        <div className="relative group flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
            }}
            onKeyDown={handleKeyPress}
            placeholder="Kuch dil ki baat share karein..."
            className="flex-1 bg-mylo-bg border border-gray-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-mylo-accent/20 focus:border-mylo-accent transition-all resize-none overflow-y-auto"
            rows={1}
            style={{ maxHeight: '150px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 bottom-1.5 p-2 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? "bg-mylo-accent text-white shadow-md hover:scale-105 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center mt-3 text-mylo-muted flex items-center justify-center gap-1">
          <Info className="w-3 h-3" /> Mylo ek AI hai, professional medical advice ke liye expert se milein.
        </p>
      </footer>
    </div>
  );
}
