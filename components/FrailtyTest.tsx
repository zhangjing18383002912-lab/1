import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Activity, Coffee, Scale, Timer, Dumbbell } from 'lucide-react';
import { FrailtyScore } from '../types';

const FrailtyTest: React.FC = () => {
  const [score, setScore] = useState<FrailtyScore>({
    weightLoss: false,
    fatigue: false,
    activity: false,
    speed: false,
    grip: false,
  });

  const toggle = (key: keyof FrailtyScore) => {
    setScore(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalScore = Object.values(score).filter(Boolean).length;
  
  const getResult = () => {
    if (totalScore === 0) return { text: "健康 (无衰弱)", color: "text-green-600", bg: "bg-green-100" };
    if (totalScore <= 2) return { text: "衰弱前期 (Pre-frail)", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { text: "衰弱 (Frail)", color: "text-red-600", bg: "bg-red-100" };
  };

  const result = getResult();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-rose-500" />
        衰弱快速自测 (Fried 标准)
      </h3>
      <p className="text-sm text-slate-500 mb-6">请根据您最近的情况，勾选符合的选项：</p>

      <div className="space-y-3">
        <button 
          onClick={() => toggle('weightLoss')}
          className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all ${score.weightLoss ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}
        >
          <div className={`p-2 rounded-full ${score.weightLoss ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Scale className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-slate-700">非意愿性体重下降</div>
            <div className="text-xs text-slate-500">过去一年体重减少超过 4.5kg 或 5%</div>
          </div>
          {score.weightLoss && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
        </button>

        <button 
          onClick={() => toggle('fatigue')}
          className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all ${score.fatigue ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}
        >
          <div className={`p-2 rounded-full ${score.fatigue ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Coffee className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-slate-700">自觉疲乏</div>
            <div className="text-xs text-slate-500">这周感觉"做什么都很费力"或"走不动路"</div>
          </div>
          {score.fatigue && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
        </button>

        <button 
          onClick={() => toggle('grip')}
          className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all ${score.grip ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}
        >
          <div className={`p-2 rounded-full ${score.grip ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-slate-700">握力减弱</div>
            <div className="text-xs text-slate-500">明显感觉手部力量变小，提重物困难</div>
          </div>
          {score.grip && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
        </button>

        <button 
          onClick={() => toggle('speed')}
          className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all ${score.speed ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}
        >
          <div className={`p-2 rounded-full ${score.speed ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Timer className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-slate-700">行走速度减慢</div>
            <div className="text-xs text-slate-500">步行 4.5 米的时间明显变长</div>
          </div>
          {score.speed && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
        </button>

        <button 
          onClick={() => toggle('activity')}
          className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all ${score.activity ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}
        >
          <div className={`p-2 rounded-full ${score.activity ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-slate-700">躯体活动量降低</div>
            <div className="text-xs text-slate-500">日常活动量显著减少，不愿出门</div>
          </div>
          {score.activity && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
        </button>
      </div>

      <div className={`mt-6 p-4 rounded-lg ${result.bg} border border-opacity-20 flex items-start gap-3`}>
        <AlertCircle className={`w-6 h-6 ${result.color} shrink-0`} />
        <div>
          <h4 className={`font-bold ${result.color} text-lg`}>评估结果: {result.text}</h4>
          <p className="text-sm text-slate-700 mt-1">
            {totalScore === 0 ? "您的状态良好，请继续保持健康的生活方式！" : 
             totalScore <= 2 ? "您处于衰弱前期，建议增加营养摄入和适当的抗阻训练。" :
             "建议您咨询医生进行全面的综合评估和干预，预防跌倒和并发症。"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FrailtyTest;