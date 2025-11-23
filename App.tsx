import React, { useState, useEffect, useRef } from 'react';
import { Phase, NavItem, ChatMessage } from './types';
import StomachScene from './components/StomachScene';
import { PhaseContent } from './components/PhaseContent';
import { askMedicalAssistant } from './services/geminiService';
import { 
  Stethoscope, 
  Hospital, 
  Home, 
  Activity, 
  MessageSquare, 
  X, 
  Send, 
  Bot,
  User,
  Info,
  Menu
} from 'lucide-react';

const NAV_ITEMS: NavItem[] = [
  { id: Phase.DIAGNOSIS, label: '确诊阶段', icon: 'Stethoscope', description: '症状、检查与治疗决策' },
  { id: Phase.HOSPITALIZATION, label: '住院阶段', icon: 'Hospital', description: '手术、化疗与围手术期' },
  { id: Phase.DISCHARGE, label: '出院康复', icon: 'Home', description: '饮食、并发症与随访' },
  { id: Phase.FRAILTY, label: '衰弱管理', icon: 'Activity', description: '营养自测与体能恢复' },
];

const App: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.DIAGNOSIS);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是您的胃癌科普助手。您可以点击模型查看详情，或者直接问我关于病情的任何问题。' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    const context = `当前用户正处于 App 的 "${NAV_ITEMS.find(n => n.id === currentPhase)?.label}" 模块。`;
    const answer = await askMedicalAssistant(userMsg.text, context);

    setChatMessages(prev => [...prev, { role: 'model', text: answer }]);
    setIsTyping(false);
  };

  // Helper to bridge content component clicks to AI chat
  const handleQuickAsk = (topic: string) => {
    setIsChatOpen(true);
    setChatInput(`请详细介绍一下：${topic}`);
    // Optionally auto-send or let user confirm
  };

  const handlePartClick = (part: string) => {
      // In a real app, this would show specific modal data. 
      // Here we direct to chat for exploration.
      setIsChatOpen(true);
      if (part === 'tumor') {
        setChatInput("我的胃里长了肿瘤，意味着什么？严重吗？");
      } else if (part === 'tumor_detail') {
        setChatInput("胃癌的肿瘤一般长在什么位置？会对消化有什么影响？");
      } else {
        setChatInput("请介绍一下胃的解剖结构和功能。");
      }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Stethoscope': return <Stethoscope size={20} />;
      case 'Hospital': return <Hospital size={20} />;
      case 'Home': return <Home size={20} />;
      case 'Activity': return <Activity size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm z-20 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800 leading-none">GastricCare 3D</h1>
            <p className="text-xs text-slate-500">全流程胃癌科普平台</p>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPhase(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentPhase === item.id 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {getIcon(item.icon)}
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          className="lg:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b absolute top-16 left-0 w-full z-20 shadow-lg">
           {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentPhase(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-6 py-4 text-sm font-medium flex items-center gap-3 border-b border-slate-50 ${
                currentPhase === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
              }`}
            >
              {getIcon(item.icon)}
              <div>
                <div className="font-bold">{item.label}</div>
                <div className="text-xs font-normal opacity-70">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel: 3D Model */}
        <div className="flex-1 lg:flex-[3] bg-slate-100 relative min-h-[40vh] lg:min-h-0 shrink-0 lg:shrink">
          <StomachScene phase={currentPhase} onPartClick={handlePartClick} />
          
          {/* Overlay Phase Info */}
          <div className="absolute top-4 left-4 max-w-xs pointer-events-none">
            <h2 className="text-2xl font-bold text-slate-800/80">{NAV_ITEMS.find(n => n.id === currentPhase)?.label}</h2>
            <p className="text-sm text-slate-600 font-medium">{NAV_ITEMS.find(n => n.id === currentPhase)?.description}</p>
          </div>
        </div>

        {/* Right Panel: Information Content */}
        <div className="flex-1 lg:flex-[2] bg-white border-l border-slate-200 flex flex-col h-full max-w-full lg:max-w-[500px] shadow-xl z-10 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <PhaseContent phase={currentPhase} onLearnMore={handleQuickAsk} />
          </div>
          
          {/* Footer Prompt */}
          <div className="p-4 bg-slate-50 border-t text-center text-xs text-slate-400 shrink-0">
            本内容仅供科普参考，不能替代医生面诊建议。
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 z-50 flex items-center gap-2"
        >
          <MessageSquare size={24} />
          <span className="font-bold pr-1">咨询 AI 助手</span>
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-[90%] sm:w-[400px] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-fadeIn">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">AI 康复助手</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  {msg.role === 'model' && <Bot size={14} className="mb-1 text-blue-500" />}
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-slate-400 text-xs flex items-center gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t rounded-b-2xl flex gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入您的问题..."
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !chatInput.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;