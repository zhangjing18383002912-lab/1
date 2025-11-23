import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Phase, VideoResource } from '../types';
import { Play, ChevronRight, AlertTriangle, Utensils, Activity, Stethoscope, Pill, Heart, Calendar, Brain, Video, X, Loader2, Sparkles, RefreshCw, Microscope, ScanEye, Layers, Scissors, Wind, Dumbbell, Fingerprint, Info } from 'lucide-react';
import FrailtyTest from './FrailtyTest';
import { generateEducationalVideo } from '../services/geminiService';

interface PhaseContentProps {
  phase: Phase;
  onLearnMore: (topic: string) => void;
}

// 优化后的提示词，追求电影级画质
const VIDEO_LIBRARY: Record<Phase, VideoResource[]> = {
  [Phase.DIAGNOSIS]: [
    { 
      id: 'v1', 
      title: '3D演示：胃癌的发生', 
      duration: '00:45', 
      thumbnailColor: 'bg-gradient-to-br from-rose-600 via-red-500 to-orange-600', 
      views: '病理机制', 
      prompt: 'Cinematic macro medical animation, extremely detailed cross-section of stomach wall, camera slowly zooming into the mucosal layer to reveal mutating cells forming a tumor, subsurface scattering, wet organic textures, 8k resolution, unreal engine 5 render.'
    },
    { 
      id: 'v2', 
      title: '第一视角：胃镜检查', 
      duration: '01:20', 
      thumbnailColor: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600', 
      views: '检查模拟', 
      prompt: 'Photorealistic first-person view from a gastroscope moving down the esophagus into the stomach, bright endoscopic light illuminating the pink gastric folds, discovering a distinct ulcerated lesion, high fidelity medical simulation, moisture and reflections.'
    },
    { 
      id: 'v3', 
      title: '图解：TNM 分期可视化', 
      duration: '00:50', 
      thumbnailColor: 'bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800', 
      views: '分期详解', 
      prompt: 'Holographic medical visualization of a transparent human torso, glowing stomach organ, highlighting lymph nodes spreading with a golden glow to indicate N-stage, clean futuristic medical interface style, 4k, volumetric lighting.'
    },
  ],
  [Phase.HOSPITALIZATION]: [
    { 
      id: 'v4', 
      title: '腹腔镜微创手术原理', 
      duration: '01:15', 
      thumbnailColor: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600', 
      views: '手术必看', 
      prompt: 'External view of a modern operating room, close up on patient abdomen with laparoscopic ports, robotic surgical arms moving precisely, schematic overlay showing internal cutting lines on the stomach, high tech, clean white aesthetic.'
    },
    { 
      id: 'v5', 
      title: '术后护理：有效咳嗽', 
      duration: '00:40', 
      thumbnailColor: 'bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-600', 
      views: '护理教学', 
      prompt: '3D character animation of a patient sitting up in hospital bed, holding a pillow firmly against their stomach wound, demonstrating deep breathing and coughing technique, soft lighting, educational and comforting style.'
    },
  ],
  [Phase.DISCHARGE]: [
    { 
      id: 'v7', 
      title: '饮食：少食多餐示范', 
      duration: '01:30', 
      thumbnailColor: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500', 
      views: '饮食管理', 
      prompt: 'Top-down cinematic food shot, a table arranged with 6 small healthy meals for a post-gastrectomy patient, soft focus background, steam rising from soup, fresh ingredients, warm sunlight, appetizing and healthy.'
    },
  ],
  [Phase.FRAILTY]: [
    { 
      id: 'v9', 
      title: '居家康复：抗阻力训练', 
      duration: '01:00', 
      thumbnailColor: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600', 
      views: '运动康复', 
      prompt: 'Full body shot of an elderly asian gentleman exercising at home with a resistance band, gentle movements, bright living room background with plants, positive energy, high quality character animation.'
    },
  ]
};

const getVideoIcon = (id: string) => {
  switch(id) {
    case 'v1': return Microscope;
    case 'v2': return ScanEye;
    case 'v3': return Layers;
    case 'v4': return Scissors;
    case 'v5': return Wind;
    case 'v7': return Utensils;
    case 'v9': return Dumbbell;
    default: return Video;
  }
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 mt-8 border-b pb-2 border-slate-100">
    <div className="p-1.5 bg-blue-100 rounded text-blue-600 shadow-sm">{icon}</div>
    {title}
  </h2>
);

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-5 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 ${className}`}>
    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
      {title}
    </h3>
    <div className="text-sm text-slate-600 leading-relaxed pl-3">{children}</div>
  </div>
);

const VideoPlayerModal: React.FC<{ video: VideoResource; onClose: () => void }> = ({ video, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(video.uri);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!video.prompt) return;
    setLoading(true);
    setError('');
    try {
      const url = await generateEducationalVideo(video.prompt);
      setVideoUrl(url);
      video.uri = url;
    } catch (err: any) {
      setError(err.message || "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-black w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[100dvh] md:max-h-[90vh] border border-slate-800 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 text-white bg-gradient-to-b from-slate-900 to-black shrink-0 border-b border-white/10">
          <h3 className="font-bold flex items-center gap-2 text-lg truncate pr-4 text-slate-100">
            <span className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">AI Video</span>
            {video.title}
          </h3>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors shrink-0">
            <X className="w-6 h-6 text-slate-400 hover:text-white" />
          </button>
        </div>
        
        {/* Player Area */}
        <div className="aspect-video bg-black flex flex-col items-center justify-center relative group w-full overflow-hidden">
           {loading ? (
             <div className="text-center p-8 max-w-md relative z-10">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative bg-slate-900 rounded-full p-4 border border-blue-500/30">
                     <Loader2 className="w-full h-full text-blue-500 animate-spin" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 tracking-tight">AI 正在渲染医学场景</h4>
                <p className="text-blue-400 font-medium text-sm animate-pulse">Gemini Veo • 8K 渲染 • 物理引擎模拟</p>
                <div className="mt-6 h-1 w-48 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/2 animate-[progress_2s_ease-in-out_infinite]"></div>
                </div>
             </div>
           ) : videoUrl ? (
             <div className="w-full h-full relative bg-black">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  playsInline
                  className="w-full h-full object-contain"
                />
             </div>
           ) : (
             <div className="text-center p-8 max-w-lg relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20 ring-1 ring-white/20 rotate-3 transition-transform group-hover:rotate-0 duration-500">
                   <Video className="w-12 h-12 text-white drop-shadow-md" />
                </div>
                
                <h4 className="text-2xl font-bold text-white mb-3">生成实时演示</h4>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                  该视频将由 <strong>Google Gemini Veo</strong> 模型根据医学指南实时生成。它能可视化难以拍摄的体内视角。
                </p>

                {error && (
                  <div className="bg-red-500/10 text-red-200 p-3 rounded-xl text-sm mb-6 border border-red-500/30 flex items-center gap-2 justify-center backdrop-blur-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                
                <button 
                  onClick={handleGenerate}
                  className="group/btn relative bg-white text-black px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                  <Play className="w-5 h-5 fill-black" />
                  <span>立即生成视频</span>
                </button>
             </div>
           )}
           
           {/* Background ambiance for empty state */}
           {!videoUrl && !loading && (
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen" />
               <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen" />
             </div>
           )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const VideoGallery: React.FC<{ videos: VideoResource[] }> = ({ videos }) => {
  const [playingVideo, setPlayingVideo] = useState<VideoResource | null>(null);

  return (
    <div className="mt-8 mb-6">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xl">
          <div className="bg-rose-500 text-white p-1.5 rounded-lg shadow-sm shadow-rose-200">
            <Video className="w-5 h-5" /> 
          </div>
          医学视频库
        </h3>
        <span className="text-[10px] font-bold tracking-widest bg-slate-900 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 shadow-sm flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          AI GENERATED
        </span>
      </div>
      
      {/* Scrollable Container with enhanced padding */}
      <div className="flex gap-4 overflow-x-auto pb-8 custom-scrollbar snap-x px-1 -mx-1">
        {videos.map((video) => {
          const VideoIcon = getVideoIcon(video.id);
          return (
            <button 
              key={video.id}
              onClick={() => setPlayingVideo(video)}
              className="relative flex-shrink-0 w-72 h-40 group snap-start text-left rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              {/* Background with Noise & Gradient */}
              <div className={`absolute inset-0 ${video.thumbnailColor} transition-transform duration-700 group-hover:scale-105`}>
                 {/* Noise overlay for texture */}
                 <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                 
                 {/* Giant Icon Background */}
                 <div className="absolute -right-6 -bottom-6 text-white opacity-10 transform -rotate-12 scale-150 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.8]">
                    <VideoIcon size={120} />
                 </div>
              </div>
              
              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content Content - Now Immersive Overlay */}
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                 {/* Top Badge */}
                 <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold border border-white/10 shadow-sm">
                      {video.views}
                    </div>
                 </div>

                 <div className="relative z-10">
                   <h4 className="text-white font-bold text-lg leading-tight drop-shadow-sm mb-1 line-clamp-2">
                     {video.title}
                   </h4>
                   <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                     <span className="flex items-center gap-1">
                       <Play className="w-3 h-3 fill-white/70" /> {video.duration}
                     </span>
                     <span className="w-1 h-1 bg-white/50 rounded-full" />
                     <span>Gemini Veo</span>
                   </div>
                 </div>
              </div>

              {/* Centered Play Button (appears on hover) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[1px]">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl transform scale-50 group-hover:scale-100 transition-all duration-300">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {playingVideo && (
        <VideoPlayerModal video={playingVideo} onClose={() => setPlayingVideo(null)} />
      )}
    </div>
  );
};

export const PhaseContent: React.FC<PhaseContentProps> = ({ phase, onLearnMore }) => {
  const [activeTab, setActiveTab] = useState(0);

  const renderVideos = () => {
    const videos = VIDEO_LIBRARY[phase];
    if (videos) return <VideoGallery videos={videos} />;
    return null;
  };

  // --- DIAGNOSIS CONTENT ---
  if (phase === Phase.DIAGNOSIS) {
    return (
      <div className="space-y-5 animate-fadeIn pb-8">
        {/* Intro */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
             <Stethoscope size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <span className="bg-blue-600 w-1.5 h-6 rounded-full inline-block"></span>
              确诊阶段：了解敌人
            </h2>
            <p className="text-slate-300 text-sm opacity-90 leading-relaxed max-w-[90%]">
              当您拿到检查报告时，第一步是保持冷静，准确了解病情分期。本阶段包含肿瘤可视化、检查科普与治疗决策辅助。
            </p>
          </div>
        </div>

        {renderVideos()}

        <SectionTitle icon={<AlertTriangle size={18} />} title="关键症状识别" />
        <div className="grid grid-cols-2 gap-3">
          {['持续性上腹痛', '进食后饱胀', '原因不明消瘦', '黑便 (柏油样)', '呕血', '吞咽哽噎感'].map((sym, i) => (
            <button key={i} onClick={() => onLearnMore(`我有${sym}的症状，这意味着什么？`)} className="bg-rose-50 text-rose-900 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 hover:shadow-sm transition-all text-left group">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 group-hover:scale-125 transition-transform" />
              {sym}
            </button>
          ))}
        </div>

        <SectionTitle icon={<Stethoscope size={18} />} title="确诊金标准" />
        <div className="space-y-4">
          <Card title="🩺 胃镜 + 病理活检">
            <p>唯一能确诊胃癌的方法。医生通过摄像头直接观察胃黏膜，并夹取小块组织进行化验。</p>
          </Card>
          <Card title="📷 增强 CT">
            <p>主要用于<strong>分期</strong>。判断肿瘤有没有侵犯周围脏器，以及是否有淋巴结转移或远处转移。</p>
          </Card>
        </div>

        <SectionTitle icon={<Pill size={18} />} title="治疗策略概览" />
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
           <div className="flex gap-4 mb-4 border-b border-slate-200 pb-4 last:mb-0 last:border-0 last:pb-0">
             <div className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs h-fit shrink-0 w-14 text-center">早期</div>
             <div className="text-sm text-slate-600">病灶局限。首选内镜切除 (ESD) 或微创手术。</div>
           </div>
           <div className="flex gap-4 mb-4 border-b border-slate-200 pb-4 last:mb-0 last:border-0 last:pb-0">
             <div className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs h-fit shrink-0 w-14 text-center">进展期</div>
             <div className="text-sm text-slate-600">局部晚期。常采用"新辅助化疗 + 手术 + 术后辅助化疗"模式。</div>
           </div>
           <div className="flex gap-4">
             <div className="bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded text-xs h-fit shrink-0 w-14 text-center">晚期</div>
             <div className="text-sm text-slate-600">已发生转移。以药物治疗（化疗、靶向、免疫）为主，延长生存期。</div>
           </div>
        </div>
      </div>
    );
  }

  // --- HOSPITALIZATION CONTENT ---
  if (phase === Phase.HOSPITALIZATION) {
    return (
      <div className="space-y-6 animate-fadeIn pb-8">
        <div className="flex border-b border-slate-200 mb-4 bg-white sticky top-0 z-10 -mx-6 px-6 pt-2">
          {['外科手术', '化疗护理', '心理调适'].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 pb-3 text-sm font-bold transition-all relative ${activeTab === idx ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
              {activeTab === idx && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/50" />}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="space-y-5 animate-fadeIn">
             {renderVideos()}
             <div className="bg-blue-50/80 text-blue-900 p-5 rounded-xl text-sm flex gap-4 items-start border border-blue-100 shadow-sm">
               <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                 <Info size={20} className="text-blue-600" />
               </div>
               <div>
                 <strong className="block mb-1 text-base">3D 交互提示</strong>
                 <span className="opacity-80">左侧 3D 模型正展示标准的<strong>D2根治术范围</strong>（虚线区域）。大部分胃体将被切除，周围淋巴结会被清扫。您可以旋转模型查看切除细节。</span>
               </div>
             </div>
             <Card title="术后 ERAS (快速康复) 要点">
               <ul className="space-y-4 mt-2">
                 <li className="flex gap-3 text-sm items-start">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                   <div>
                      <span className="font-bold text-slate-700 block">早期下床</span>
                      <span className="text-slate-500 text-xs">术后第 1 天在护士协助下床边站立，促进通气。</span>
                   </div>
                 </li>
                 <li className="flex gap-3 text-sm items-start">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                   <div>
                      <span className="font-bold text-slate-700 block">多模式镇痛</span>
                      <span className="text-slate-500 text-xs">不痛才能休息好、才能敢于咳嗽排痰。</span>
                   </div>
                 </li>
               </ul>
             </Card>
          </div>
        )}

        {activeTab === 1 && (
           <div className="space-y-5 animate-fadeIn">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-xl border border-teal-100 flex gap-4 shadow-sm">
                 <div className="bg-white p-2.5 rounded-full shadow-sm h-fit">
                    <Pill className="text-teal-500 w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-teal-800 text-base mb-1">化疗就像"大扫除"</h3>
                   <p className="text-xs text-teal-700/80 leading-relaxed">虽然会杀伤正常细胞（如毛囊、黏膜），但主要目标是清除肉眼看不见的微小癌细胞。这是预防复发的关键步骤。</p>
                 </div>
              </div>
              
              <h3 className="font-bold text-slate-800 mt-2 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" />
                常见副作用红绿灯
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-green-200 transition-colors">
                   <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
                   <div className="flex-1">
                      <span className="text-sm font-bold text-slate-700 block">轻度恶心、乏力、脱发</span>
                      <span className="text-xs text-slate-400">属于正常反应，居家观察即可</span>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-yellow-200 transition-colors">
                   <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30" />
                   <div className="flex-1">
                      <span className="text-sm font-bold text-slate-700 block">腹泻 &gt; 5次/天，口腔溃疡</span>
                      <span className="text-xs text-slate-400">影响进食时，请及时联系医生</span>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 border border-rose-100 rounded-xl bg-rose-50 shadow-sm">
                   <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse shadow-lg shadow-red-600/30" />
                   <div className="flex-1">
                      <span className="text-sm font-bold text-rose-800 block">发热 &gt; 38℃ (化疗后7-10天)</span>
                      <span className="text-xs text-rose-600 font-bold">可能发生粒细胞缺乏，立即急诊！</span>
                   </div>
                </div>
              </div>
           </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <Card title="心理调适">
              <p className="mb-4">确诊胃癌通常会经历"否认-愤怒-妥协-抑郁-接受"五个阶段。感到恐惧是正常的，不要压抑自己的情绪。</p>
              <button 
                onClick={() => onLearnMore('我感觉很焦虑，担心治不好，怎么办？')}
                className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Brain size={16} />
                向 AI 倾诉焦虑
              </button>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // --- DISCHARGE CONTENT ---
  if (phase === Phase.DISCHARGE) {
    return (
      <div className="space-y-6 animate-fadeIn pb-8">
         <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Heart size={140} />
             </div>
             <div className="relative z-10 flex gap-4 items-center">
               <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                 <RefreshCw className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h3 className="font-bold text-xl mb-1">新生活的开始</h3>
                 <p className="text-sm text-green-50 opacity-90">您现在拥有的是一个"小鸟胃"，需要像照顾婴儿一样照顾它。</p>
               </div>
             </div>
         </div>

         {renderVideos()}

         <SectionTitle icon={<Utensils size={18} />} title="饮食黄金法则" />
         <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            {[
              { label: '细嚼慢咽', desc: '每口饭咀嚼 20-30 次，减轻残胃负担。' },
              { label: '少食多餐', desc: '每天 6-7 餐，每餐 7 分饱。' },
              { label: '干稀分离', desc: '吃饭时不喝汤，喝汤时不吃饭（间隔30分钟）。' },
              { label: '严格忌口', desc: '不吃糯米（汤圆）、柿子、山楂，防肠梗阻。' }
            ].map((rule, i) => (
              <div key={i} className="flex p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors items-center">
                <div className="font-bold text-slate-700 w-24 shrink-0 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                   {rule.label}
                </div>
                <span className="text-sm text-slate-500">{rule.desc}</span>
              </div>
            ))}
         </div>

         <SectionTitle icon={<AlertTriangle size={18} />} title="并发症警示" />
         <div className="grid grid-cols-1 gap-4">
           <Card title="倾倒综合征">
             <div className="text-xs text-slate-500 mb-3 leading-relaxed">进食甜食或流质过快 -&gt; 血糖急剧波动 -&gt; 出现头晕、心慌、冷汗、无力。</div>
             <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-2">
               <span className="font-bold text-green-600 shrink-0">✅ 对策：</span>
               <span className="text-slate-600">进食后平卧 20 分钟；少吃甜食；如发作可进食少量饼干缓解。</span>
             </div>
           </Card>
           <Card title="缺铁性贫血">
             <div className="text-xs text-slate-500 mb-3 leading-relaxed">胃酸减少导致铁吸收障碍，表现为面色苍白、易疲劳。</div>
             <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-2">
               <span className="font-bold text-green-600 shrink-0">✅ 对策：</span>
               <span className="text-slate-600">多吃瘦肉、鸭血；遵医嘱定期补充铁剂和维生素 B12 注射。</span>
             </div>
           </Card>
         </div>
      </div>
    );
  }

  // --- FRAILTY CONTENT ---
  if (phase === Phase.FRAILTY) {
    return (
      <div className="space-y-6 animate-fadeIn pb-8">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
            <Fingerprint className="w-5 h-5 text-orange-500" /> 
            衰弱：隐形的杀手
          </h3>
          <p className="text-sm text-orange-700/80 leading-relaxed">
            很多患者术后恢复慢，不是因为手术没做好，而是因为处于"衰弱"状态（肌肉流失、储备力下降）。通过干预，您可以逆转衰弱！
          </p>
        </div>

        {renderVideos()}

        <SectionTitle icon={<Activity size={18} />} title="衰弱自测 (Fried 量表)" />
        <FrailtyTest />

        <SectionTitle icon={<Utensils size={18} />} title="营养干预处方" />
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white border border-slate-100 p-4 rounded-xl text-center hover:shadow-md transition-shadow group">
             <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                <Utensils size={18} className="text-blue-500" />
             </div>
             <div className="font-bold text-slate-700 text-lg mb-1">优质蛋白</div>
             <div className="text-xs text-slate-400 mb-2">1.2-1.5g / kg体重</div>
             <div className="text-[10px] bg-slate-100 text-slate-500 py-1 px-2 rounded-full inline-block">鱼、蛋、乳清蛋白</div>
           </div>
           <div className="bg-white border border-slate-100 p-4 rounded-xl text-center hover:shadow-md transition-shadow group">
             <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 transition-colors">
                <Pill size={18} className="text-green-500" />
             </div>
             <div className="font-bold text-slate-700 text-lg mb-1">ONS 补充</div>
             <div className="text-xs text-slate-400 mb-2">口服营养补充剂</div>
             <div className="text-[10px] bg-slate-100 text-slate-500 py-1 px-2 rounded-full inline-block">安素/能全素等</div>
           </div>
        </div>

        <SectionTitle icon={<Dumbbell size={18} />} title="运动康复处方" />
        <Card title="抗阻 + 有氧组合">
          <ul className="list-none pl-1 space-y-4 text-sm text-slate-600 mt-2">
            <li className="relative pl-6">
               <div className="absolute left-0 top-1 w-2 h-2 bg-purple-500 rounded-full" />
               <strong>抗阻训练 (长肌肉)：</strong> <br/>
               <span className="text-xs text-slate-500">使用弹力带或装满水的矿泉水瓶，做举臂、抬腿动作。隔天一次，每次 15 分钟。</span>
            </li>
            <li className="relative pl-6">
               <div className="absolute left-0 top-1 w-2 h-2 bg-pink-500 rounded-full" />
               <strong>有氧运动 (练心肺)：</strong> <br/>
               <span className="text-xs text-slate-500">推荐散步、太极拳。目标：微微出汗，但这说话不气喘（Borg 评分 12-13 分）。</span>
            </li>
          </ul>
        </Card>
      </div>
    );
  }

  return null;
};
