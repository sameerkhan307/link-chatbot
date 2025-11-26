import React, { useState } from 'react';

interface UrlConfigProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  onClear: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const UrlConfig: React.FC<UrlConfigProps> = ({ currentUrl, onUrlChange, onClear, isOpen, toggleSidebar }) => {
  const [inputValue, setInputValue] = useState(currentUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onUrlChange(inputValue.trim());
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-72 bg-gray-900 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 h-8 w-8 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fa fa-globe text-white text-sm"></i>
            </div>
            <h1 className="font-bold text-lg tracking-tight">UrlGenie</h1>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Knowledge Source
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Target URL</label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                    required
                  />
                  {currentUrl && currentUrl === inputValue && (
                     <i className="fa fa-check-circle text-emerald-500 absolute right-3 top-3"></i>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter a website URL. The AI will answer questions based on this page.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50"
              >
                <i className="fa fa-save"></i>
                Set Context URL
              </button>

              {currentUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    setInputValue('');
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-lg transition-colors border border-gray-700"
                >
                  Clear Context
                </button>
              )}
            </form>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <i className="fa fa-info-circle"></i>
              <span className="font-semibold text-sm">How it works</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Gemini uses Google Search grounding to access the latest information from the URL you provide. It acts like a customer support agent for that site.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          Powered by Gemini 2.5 Flash
        </div>
      </aside>
    </>
  );
};
