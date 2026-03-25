import { useState, useRef } from 'react';
import { Bot, Send, User, Sparkles, ShieldCheck, Globe, Trash2, FilePlus, Paperclip, Eye, X, Book } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  role: 'agent' | 'user';
  content: string;
  sources?: string[];
};

export default function Advisor() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'web' | 'rag'>('web');
  const [kbContent, setKbContent] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(`session_${Math.random().toString(36).substr(2, 9)}`);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{name: string, content: string} | null>(null);
  const [showKbModal, setShowKbModal] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'agent', 
      content: "Hi! I'm 'Mavericks Financial AI'. You can now upload, view, and delete your documents for a custom knowledge base. I'll use FAISS to strictly search your data!" 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        await axios.post(`http://localhost:8000/api/upload?session_id=${sessionId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUploadedFiles(prev => prev.includes(file.name) ? prev : [...prev, file.name]);
      } catch (err) {
        console.error("Upload failed:", file.name, err);
      }
    }
    setIsUploading(false);
    // Reset input
    e.target.value = '';
  };

  const deleteFile = async (filename: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/documents/${encodeURIComponent(filename)}?session_id=${sessionId}`);
      setUploadedFiles(prev => prev.filter(f => f !== filename));
    } catch (err) {
      console.error("Delete failed:", filename, err);
    }
  };

  const viewFile = async (filename: string) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/documents/${encodeURIComponent(filename)}?session_id=${sessionId}`);
      setPreviewFile({ name: filename, content: res.data.content });
    } catch (err) {
      console.error("View failed:", filename, err);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = inputValue.trim();
    
    // 1. Add User message to chat
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setInputValue('');
    setIsGenerating(true);

    try {
      // 2. Query the Advisor API
      const response = await axios.post('http://localhost:8000/api/advisor', {
        query: userMessage,
        mode: mode,
        kb_content: mode === 'rag' ? kbContent : '',
        session_id: sessionId
      });

      // 3. Add Agent response
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + '1', 
        role: 'agent', 
        content: response.data.answer,
        sources: response.data.sources
      }]);
    } catch (error) {
      console.error("Advisor Error:", error);
      setMessages(prev => [...prev, { 
        id: 'error', 
        role: 'agent', 
        content: "I'm having trouble connecting to my knowledge base. Please ensure the backend is running." 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        id: '1', 
        role: 'agent', 
        content: "Chat cleared. I'm ready for your next question!" 
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white pt-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden pb-10 transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-400/10 dark:bg-indigo-600/20 blur-[150px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col h-[calc(100vh-120px)] max-h-[900px]">
        
        {/* Chat Interface Container */}
        <div className="flex-1 flex flex-col bg-white/80 dark:bg-[#111111]/80 border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          
          {/* Internal Header & Controls */}
          <div className="p-6 border-b border-black/5 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-bold text-lg">Financial AI</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10">
                        <button 
                            onClick={() => setMode('web')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'web' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            Web
                        </button>
                        <button 
                            onClick={() => setMode('rag')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'rag' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            RAG (Strict)
                        </button>
                    </div>

                    <div className="relative">
                        <input 
                            type="file" 
                            id="file-upload" 
                            className="hidden" 
                            multiple 
                            onChange={handleFileUpload}
                            accept=".pdf,.txt,.md"
                        />
                        <label 
                            htmlFor="file-upload"
                            className={`p-2 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all ${isUploading ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 animate-pulse' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-500'}`}
                            title="Upload Knowledge Base File (PDF/TXT)"
                        >
                            <FilePlus className="w-4 h-4" />
                        </label>
                    </div>

                    <button 
                        onClick={() => setShowKbModal(true)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-400 hover:text-indigo-500 transition-all"
                        title="View/Edit Pasted Knowledge Base"
                    >
                        <Book className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={clearChat}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-400 hover:text-red-500 transition-all"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                    {uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full text-[10px] font-medium text-indigo-600 dark:text-indigo-400 shadow-sm group">
                            <Paperclip className="w-3 h-3" />
                            <span className="max-w-[120px] truncate">{file}</span>
                            <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => viewFile(file)} className="hover:text-indigo-800 dark:hover:text-indigo-300">
                                    <Eye className="w-3 h-3" />
                                </button>
                                <button onClick={() => deleteFile(file)} className="hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* We moved kbContent input to the modal */}
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'agent' && (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-indigo-500/20">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 max-w-[85%]">
                    <div 
                    className={`px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-[#1A1A1A] border border-black/5 dark:border-white/10 text-slate-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                    >
                        {msg.role === 'agent' ? (
                            <div className="prose dark:prose-invert prose-slate prose-sm max-w-none 
                                prose-p:leading-relaxed prose-pre:bg-black/5 dark:prose-pre:bg-white/5 
                                prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            msg.content
                        )}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-2">
                             {msg.sources.map((s, i) => (
                                <span key={i} className="text-[10px] uppercase font-bold tracking-widest text-indigo-500/70 border border-indigo-500/20 rounded-full px-2 py-0.5">
                                    {s}
                                </span>
                             ))}
                        </div>
                    )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-1 border border-black/5 dark:border-white/5">
                    <User className="w-6 h-6 text-slate-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex gap-5 justify-start">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 mt-1 animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 text-slate-500 dark:text-gray-400 px-6 py-4 rounded-[2rem] rounded-tl-none flex items-center gap-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-50/50 dark:bg-[#111111]/50 border-t border-black/5 dark:border-white/10">
            <div className="relative flex items-center max-w-5xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isGenerating ? "Consulting FAISS index..." : "Ask about tax slabs, investment options, or FIRE rules..."}
                disabled={isGenerating}
                className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-full pl-8 pr-16 py-5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-xl disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isGenerating}
                className="absolute right-3 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-gray-700 disabled:text-slate-100 dark:disabled:text-gray-400 rounded-full flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold">
              AI guidance is not professional financial advice
            </p>
          </div>
          
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111111] w-full max-w-3xl max-h-[80vh] rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold">{previewFile.name}</h3>
                    </div>
                    <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 text-sm leading-relaxed text-slate-600 dark:text-gray-300 whitespace-pre-wrap">
                    {previewFile.content}
                </div>
                <div className="p-4 border-t border-black/5 dark:border-white/10 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Extracted text for RAG indexing
                </div>
            </div>
        </div>
      )}

      {/* Pasted Knowledge Base Modal */}
      {showKbModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111111] w-full max-w-3xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-indigo-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <Book className="w-5 h-5 text-indigo-600" />
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Pasted Knowledge Base</h3>
                            <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold mt-1">Manual Input (Strict RAG)</p>
                        </div>
                    </div>
                    <button onClick={() => setShowKbModal(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <textarea
                        value={kbContent}
                        onChange={(e) => setKbContent(e.target.value)}
                        placeholder="Paste your custom knowledge base here... The AI will strictly use this text (plus any uploaded files) to answer your questions."
                        className="w-full h-[400px] bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm text-slate-800 dark:text-gray-200 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none shadow-inner custom-scrollbar"
                    />
                </div>
                <div className="p-4 border-t border-black/5 dark:border-white/10 flex justify-end bg-slate-50 dark:bg-black/20">
                    <button 
                        onClick={() => setShowKbModal(false)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all font-semibold"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
