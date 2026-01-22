import { X, Github, FileText, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

const TaskDetailPanel = ({ task, onClose }) => {
    if (!task) return null;

    // Mock AI Data (Replace with real data from task.submission.aiReview later)
    const aiReview = {
        score: 88,
        feedback: [
            { type: 'success', title: 'Good modularity', desc: 'Components are well-structured and reusable' },
            { type: 'success', title: 'Clean code structure', desc: 'Follows best practices and conventions' },
            { type: 'warning', title: 'Unused variable detected', desc: "Variable 'tempData' on line 42 is declared but never used" },
            { type: 'warning', title: 'Consider adding error handling', desc: 'API calls should include try-catch blocks' },
        ]
    };

    return (
        <div className="w-100 bg-[#1e293b] border-l border-gray-700 flex flex-col h-full absolute right-0 top-0 shadow-2xl z-20 overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-700 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-400">TASK #{task._id.slice(-4)}</span>
                        <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded font-bold border border-yellow-500/30">
                            {task.status}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold text-white leading-tight">{task.title}</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Assignee Section */}
                <div className="bg-[#0f172a] p-4 rounded-lg flex items-center gap-3 border border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                        {task.assignedTo?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="text-sm text-white font-medium">{task.assignedTo?.name || 'Unassigned'}</p>
                        <p className="text-xs text-gray-500">Assigned Developer</p>
                    </div>
                </div>

                {/* Submission Section */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Submission</h3>
                    <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                <FileText size={18} />
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">navbar.js</p>
                                <p className="text-xs text-gray-500">Updated 2 hours ago</p>
                            </div>
                        </div>
                        <a href="#" className="text-xs text-cyan-400 flex items-center gap-1 hover:underline">
                            <Github size={12} /> View on GitHub <ExternalLink size={10} />
                        </a>
                    </div>
                </div>

                {/* AI Code Review Section */}
                <div className="border border-indigo-500/30 rounded-xl overflow-hidden relative bg-[#0f172a]">
                    {/* Header */}
                    <div className="bg-indigo-600/10 p-4 border-b border-indigo-500/20 flex items-center gap-2">
                        <div className="bg-indigo-500 p-1 rounded text-white"><CheckCircle size={14} /></div>
                        <h3 className="text-white font-semibold text-sm">AI Code Review</h3>
                    </div>

                    <div className="p-6 flex flex-col items-center">
                        {/* Score Circle */}
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <span className="text-3xl font-bold text-white">{aiReview.score}</span>
                        </div>
                        <p className="text-gray-400 text-xs mb-6">Quality Score</p>

                        {/* Feedback Items */}
                        <div className="w-full space-y-3">
                            {aiReview.feedback.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg border text-left ${item.type === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/20'
                                        : 'bg-amber-500/10 border-amber-500/20'
                                        }`}
                                >
                                    <h4 className={`text-xs font-bold mb-1 ${item.type === 'success' ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                        {item.title}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPanel;