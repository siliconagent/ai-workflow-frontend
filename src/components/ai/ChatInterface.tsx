// src\components\ai\ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaSpinner, FaTimes, FaTrash } from 'react-icons/fa';
import { useAI } from '../../hooks/useAI';
import { ChatMessage, MessageRole } from '../../types/ai.types';

interface ChatInterfaceProps {
  workflowId?: string;
  minimized?: boolean;
  onGenerateWorkflow?: (workflow: any) => void;
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  workflowId,
  minimized = false,
  onGenerateWorkflow,
  onClose
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isSending,
    session,
    sendMessage,
    clearConversation,
    generateNewWorkflow
  } = useAI(workflowId);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const trimmedMessage = inputMessage.trim();
    setInputMessage('');
    
    try {
      // If we're looking at a workflow, include it in the context
      const context = workflowId ? { workflowId } : undefined;
      await sendMessage(trimmedMessage, context);
      
      // If message contains workflow generation request and callback is provided
      if (onGenerateWorkflow && 
          (trimmedMessage.toLowerCase().includes('create workflow') || 
           trimmedMessage.toLowerCase().includes('generate workflow'))) {
        try {
          const workflow = await generateNewWorkflow(trimmedMessage);
          if (workflow && onGenerateWorkflow) {
            onGenerateWorkflow(workflow);
          }
        } catch (error) {
          console.error('Failed to generate workflow:', error);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation history?')) {
      clearConversation();
    }
  };

  if (minimized) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
        <div className="flex items-center justify-center">
          <FaRobot className="text-primary mr-2" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-primary text-white p-3 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center">
          <FaRobot className="mr-2" />
          <h3 className="font-medium">AI Assistant</h3>
          {session && (
            <div className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Session: {session.id.substring(0, 8)}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <button
            onClick={handleClearConversation}
            className="p-1.5 text-white/80 hover:text-white mr-2"
            title="Clear conversation"
          >
            <FaTrash size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white"
              title="Close"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaRobot size={32} className="mx-auto mb-2 text-primary" />
            <p>How can I help you today?</p>
            <p className="text-sm mt-2">
              Try asking me to create a workflow, suggest improvements, or help with specific tasks.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}
        {(isLoading || isSending) && (
          <div className="flex items-center justify-center p-2">
            <FaSpinner className="animate-spin text-primary mr-2" />
            <span className="text-sm text-gray-500">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-r-lg disabled:bg-gray-400"
            disabled={!inputMessage.trim() || isSending}
          >
            {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          <p>
            Try: "Create a workflow for customer onboarding" or "Suggest improvements for my current workflow"
          </p>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === MessageRole.ASSISTANT;
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isAssistant 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-primary/10 text-gray-900'
        }`}
      >
        <div className="flex items-center mb-1">
          {isAssistant ? (
            <FaRobot className="mr-2 text-primary" />
          ) : (
            <FaUser className="mr-2 text-gray-600" />
          )}
          <span className="text-xs font-medium">
            {isAssistant ? 'AI Assistant' : 'You'}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        <div className="text-right mt-1">
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
