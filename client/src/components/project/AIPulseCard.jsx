import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const AIPulseCard = ({ aiSummary }) => {
    return (
        <div className="bg-gradient-to-br from-[#1e293b] to-[#2a3655] p-1 rounded-2xl shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 blur-xl opacity-50 group-hover:opacity-70 transition duration-1000"></div>
            <div className="bg-[#1e293b]/90 backdrop-blur p-6 rounded-xl relative z-10 h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Clock className="w-6 h-6 text-white animate-pulse-slow" />
                    </div>
                    <h3 className="text-lg font-bold text-white">AI Project Pulse</h3>
                </div>
                <p className="text-gray-300 text-sm mb-5 leading-relaxed italic">
                    {aiSummary || "AI is analyzing your project patterns. Keep adding tasks to generate insights."}
                </p>
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-400 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Team Velocity</span><span className="text-emerald-400 font-medium">Stable</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-400 flex items-center gap-2"><AlertCircle size={14} className="text-yellow-500" /> Detected Risks</span><span className="text-yellow-400 font-medium">None</span></div>
                </div>
            </div>
        </div>
    );
};

export default AIPulseCard;