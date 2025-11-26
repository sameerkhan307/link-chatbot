import React from 'react';
import { Message, Sender } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs shadow-sm
          ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          <i className={`fa ${isUser ? 'fa-user' : 'fa-robot'}`}></i>
        </div>

        {/* Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
          }`}>
          {message.text}

          {/* Sources Section (if available) */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <p className="text-xs font-semibold opacity-70 mb-1">Sources:</p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded transition-colors duration-200 no-underline"
                  >
                    <i className="fa fa-external-link-alt text-[10px]"></i>
                    <span className="truncate max-w-[150px]">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <span className={`text-[10px] absolute bottom-1 ${isUser ? 'left-2 text-indigo-200' : 'right-2 text-gray-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
