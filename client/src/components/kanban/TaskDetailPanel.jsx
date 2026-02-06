import { X, Github, FileText, CheckCircle, AlertTriangle, ExternalLink, UserCheck, UserX, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

const TaskDetailPanel = ({ task, onClose, onUpdate }) => {
    const { user } = useAuth();

    if (!task) return null;

    // --- LOGIC: Check Permissions ---
    // Handle both populated objects and raw IDs
    const isOwner = (task.createdBy?._id || task.createdBy) === user?._id;
    const isAssignee = (task.assignedTo?._id || task.assignedTo) === user?._id;

    // --- HANDLERS ---
    const handleInviteResponse = async (response) => {
        try {
            await api.patch(`/task/${task._id}/respond`, { response });
            if (onUpdate) onUpdate(); // Refresh Kanban board
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleLeaveRequest = async () => {
        if (!confirm("Are you sure you want to request to leave this task?")) return;
        try {
            await api.patch(`/task/${task._id}/leave`);
            alert("Leave request sent to the task owner.");
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const handleOwnerDecision = async (action) => {
        try {
            await api.patch(`/task/${task._id}/handle-leave`, { action });
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    // Mock AI Data (Placeholder for future real data)
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
        <div className="w-96 md:w-[450px] bg-[#1e293b] border-l border-gray-700 flex flex-col h-full absolute right-0 top-0 shadow-2xl z-50 overflow-y-auto font-sans">

            {/* --- HEADER --- */}
            <div className="p-6 border-b border-gray-700 flex justify-between items-start sticky top-0 bg-[#1e293b] z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-400">TASK #{task._id.slice(-4)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${task.status === 'Merged' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                                task.status === 'In-Progress' ? 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' :
                                    'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                            }`}>
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

                {/* --- ACTION ALERTS (Priority UI) --- */}

                {/* 1. Invitation Pending (For Assignee) */}
                {isAssignee && task.assignmentStatus === 'Pending' && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <AlertTriangle size={16} />
                            <h3 className="text-sm font-bold">Invitation Pending</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">You have been assigned to this task. Do you accept?</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleInviteResponse('Accept')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded text-xs font-medium transition">
                                Accept
                            </button>
                            <button onClick={() => handleInviteResponse('Reject')} className="flex-1 bg-gray-700 hover:bg-red-600/80 text-white py-1.5 rounded text-xs font-medium transition">
                                Reject
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Leave Request Pending (For Owner) */}
                {isOwner && task.leaveRequested && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <UserX size={16} />
                            <h3 className="text-sm font-bold">Leave Request</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            <span className="text-white font-medium">{task.assignedTo?.name}</span> wants to leave this task.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => handleOwnerDecision('Approve')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-medium transition">
                                Remove User
                            </button>
                            <button onClick={() => handleOwnerDecision('Reject')} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded text-xs font-medium transition">
                                Keep User
                            </button>
                        </div>
                    </div>
                )}

                {/* --- ASSIGNEE SECTION --- */}
                <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Assignee</h3>
                        {/* Leave Button for Assignee */}
                        {isAssignee && task.assignmentStatus === 'Active' && !task.leaveRequested && (
                            <button onClick={handleLeaveRequest} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition" title="Request to leave task">
                                <LogOut size={10} /> Request Leave
                            </button>
                        )}
                        {isAssignee && task.leaveRequested && (
                            <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                Leave Pending...
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {task.assignedTo?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">{task.assignedTo?.name || 'Unassigned'}</p>
                            <p className="text-xs text-gray-500">{task.assignedTo?.email || 'No developer assigned'}</p>
                        </div>
                    </div>
                </div>

                {/* --- SUBMISSION SECTION --- */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Submission</h3>
                    <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 transition hover:border-indigo-500/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
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

                {/* --- AI CODE REVIEW SECTION --- */}
                <div className="border border-indigo-500/30 rounded-xl overflow-hidden relative bg-[#0f172a]">
                    <div className="bg-indigo-600/10 p-4 border-b border-indigo-500/20 flex items-center gap-2">
                        <div className="bg-indigo-500 p-1 rounded text-white shadow-[0_0_10px_#6366f1]"><CheckCircle size={14} /></div>
                        <h3 className="text-white font-semibold text-sm">AI Code Review</h3>
                    </div>

                    <div className="p-6 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-500/5">
                            <span className="text-3xl font-bold text-white">{aiReview.score}</span>
                        </div>
                        <p className="text-gray-400 text-xs mb-6 font-medium">Quality Score</p>

                        <div className="w-full space-y-3">
                            {aiReview.feedback.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg border text-left transition hover:translate-x-1 ${item.type === 'success'
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