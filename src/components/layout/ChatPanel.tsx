import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaChevronRight, FaChevronLeft, FaPaperPlane } from 'react-icons/fa';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  collapsed,
  onToggleCollapse
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your workflow assistant. I can help you design, build, and troubleshoot workflows. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple mock AI response function - this would be replaced by an actual AI service
  const getAIResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('create workflow') || lowerCaseMessage.includes('new workflow')) {
      return "I'd be happy to help you create a new workflow! What kind of process would you like to automate?";
    }
    
    if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('how to')) {
      return "I can help with designing workflows, creating forms, configuring automation rules, and more. Could you tell me more specifically what you're trying to accomplish?";
    }
    
    return "I understand you're interested in workflow automation. Could you provide more details about your specific needs so I can assist you better?";
  };

  if (collapsed) {
    return (
      <div className="chat-panel-collapsed w-12 h-full bg-card border-l border-border flex flex-col items-center">
        <button
          onClick={onToggleCollapse}
          className="w-full p-3 flex justify-center hover:bg-secondary border-b border-border"
          title="Expand Chat Panel"
        >
          <FaChevronLeft />
        </button>
        <div className="flex-grow flex items-center justify-center">
          <FaRobot className="text-primary rotate-90" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-panel w-80 h-full bg-card border-l border-border flex flex-col">
      <div className="chat-header flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <FaRobot className="text-primary mr-2" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-secondary"
          title="Collapse Chat Panel"
        >
          <FaChevronRight />
        </button>
      </div>
      
      <div className="chat-messages flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-primary/10 text-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <div className="text-sm">{message.content}</div>
              <div className="text-xs text-right mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground max-w-[80%] rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI Assistant..."
            className="flex-grow p-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
