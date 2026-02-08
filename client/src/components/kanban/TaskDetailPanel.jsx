import { useState, useEffect } from 'react';
import { X, Github, FileText, CheckCircle, AlertTriangle, ExternalLink, UserX, LogOut, Clock, Upload, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

const TaskDetailPanel = ({ task, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Submission Form State
    const [submissionData, setSubmissionData] = useState({
        contentUrl: '',
        comment: '',
        file: null
    });

    if (!task) return null;

    const isOwner = (task.createdBy?._id || task.createdBy) === user?._id;
    const isAssignee = (task.assignedTo?._id || task.assignedTo) === user?._id;

    // --- 1. FETCH SUBMISSIONS ---
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                // Assuming route: GET /api/submissions/task/:taskId
                const { data } = await api.get(`/submissions/task/${task._id}`);
                setSubmissions(data.data);
            } catch (error) {
                console.error("Failed to load submissions", error);
            }
        };
        if (task._id) fetchSubmissions();
    }, [task._id]);

    // --- 2. DEADLINE COUNTDOWN LOGIC ---
    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!task.deadline) return 'No Deadline';
            const difference = new Date(task.deadline) - new Date();

            if (difference < 0) return 'Overdue';

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);

            return `${days}d ${hours}h ${minutes}m remaining`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [task.deadline]);

    // --- HANDLERS ---

    const handleStatusChange = async (newStatus) => {
        try {
            await api.patch(`/task/${task._id}/status`, { status: newStatus });
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('taskId', task._id);
            formData.append('comment', submissionData.comment);

            // Handle File vs URL
            if (submissionData.file) {
                formData.append('submissionFile', submissionData.file);
            } else {
                formData.append('contentUrl', submissionData.contentUrl);
            }

            // Call Backend: POST /api/submissions
            await api.post('/submissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Work submitted successfully!');
            setSubmissionData({ contentUrl: '', comment: '', file: null });
            if (onUpdate) onUpdate(); // Refresh parent to show 'Review-Requested' status
        } catch (err) {
            alert(err.response?.data?.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteResponse = async (response) => {
        try {
            await api.post(`/task/${task._id}/respond`, { response: response.toLowerCase() });
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    // Get the latest AI review from the most recent approved submission
    const latestAIReview = submissions.find(s => s.aiReview && s.aiReview.score)?.aiReview;

    return (
        <div className="w-96 md:w-[500px] bg-[#1e293b] border-l border-gray-700 flex flex-col h-full absolute right-0 top-0 shadow-2xl z-50 font-sans animate-in slide-in-from-right duration-300">

            {/* --- HEADER --- */}
            <div className="p-6 border-b border-gray-700 flex justify-between items-start sticky top-0 bg-[#1e293b] z-10 shadow-md">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500">#{task._id.slice(-4)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border uppercase tracking-wider ${task.status === 'Merged' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                task.status === 'In-Progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                    task.status === 'Review-Requested' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-gray-700/50 text-gray-400 border-gray-600'
                                }`}>
                                {task.status}
                            </span>
                        </div>
                        {/* Countdown Timer */}
                        {task.deadline && (
                            <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${timeLeft === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-300'
                                }`}>
                                <Clock size={12} />
                                {timeLeft}
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-white leading-tight mb-2">{task.title}</h2>
                    <p className="text-sm text-gray-400">{task.description || 'No description provided.'}</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition ml-4">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* --- 1. ACTION ALERTS --- */}
                {isAssignee && task.assignmentStatus === 'Pending' && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <AlertTriangle size={18} />
                            <h3 className="text-sm font-bold">New Assignment</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">You have been assigned to this task. Accept to start tracking time.</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleInviteResponse('Accept')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold transition">
                                Accept Assignment
                            </button>
                            <button onClick={() => handleInviteResponse('Decline')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs font-bold transition">
                                Decline
                            </button>
                        </div>
                    </div>
                )}

                {/* --- 2. WORKFLOW ACTIONS (Start / Submit) --- */}
                {isAssignee && task.assignmentStatus === 'Active' && (
                    <div className="space-y-4">
                        {/* A. START TASK */}
                        {task.status === 'To-Do' && (
                            <button
                                onClick={() => handleStatusChange('In-Progress')}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} /> Start Working on Task
                            </button>
                        )}

                        {/* B. SUBMIT WORK FORM */}
                        {task.status === 'In-Progress' && (
                            <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-5 shadow-inner">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Upload size={16} className="text-cyan-400" /> Submit Your Work
                                </h3>
                                <form onSubmit={handleSubmitWork} className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Repository Link or URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://github.com/..."
                                            className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                                            value={submissionData.contentUrl}
                                            onChange={e => setSubmissionData({ ...submissionData, contentUrl: e.target.value })}
                                            disabled={!!submissionData.file}
                                        />
                                    </div>
                                    <div className="text-center text-xs text-gray-500">- OR -</div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Upload File</label>
                                        <input
                                            type="file"
                                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                                            onChange={e => setSubmissionData({ ...submissionData, file: e.target.files[0] })}
                                            disabled={!!submissionData.contentUrl}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Comments</label>
                                        <textarea
                                            placeholder="Describe what you changed..."
                                            className="w-full bg-[#1e293b] border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none h-20 resize-none"
                                            value={submissionData.comment}
                                            onChange={e => setSubmissionData({ ...submissionData, comment: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Uploading...' : <><Send size={16} /> Submit for Review</>}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 3. SUBMISSION HISTORY & AI FEEDBACK --- */}
                {submissions.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                            <FileText size={14} /> Submission History
                        </h3>

                        {/* List */}
                        <div className="space-y-3">
                            {submissions.map((sub) => (
                                <div key={sub._id} className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 group hover:border-indigo-500/30 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium truncate max-w-[150px]">
                                                    {sub.contentUrl ? 'Link Submission' : 'File Upload'}
                                                </p>
                                                <p className="text-[10px] text-gray-500">
                                                    {new Date(sub.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${sub.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            sub.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </div>

                                    {sub.comment && (
                                        <p className="text-xs text-gray-400 italic mb-3 pl-2 border-l-2 border-gray-700">
                                            "{sub.comment}"
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        {sub.contentUrl && (
                                            <a href={sub.contentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                                                <ExternalLink size={10} /> View Content
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- 4. AI REVIEW DISPLAY (From Latest Approved Submission) --- */}
                {latestAIReview && (
                    <div className="border border-indigo-500/30 rounded-xl overflow-hidden relative bg-[#0f172a] animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-indigo-600/10 p-4 border-b border-indigo-500/20 flex items-center gap-2">
                            <div className="bg-indigo-500 p-1 rounded text-white shadow-[0_0_10px_#6366f1]"><CheckCircle size={14} /></div>
                            <h3 className="text-white font-semibold text-sm">AI Quality Analysis</h3>
                        </div>

                        <div className="p-6 flex flex-col items-center">
                            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center mb-2 shadow-lg ${latestAIReview.score > 70 ? 'border-emerald-500 bg-emerald-500/5 shadow-emerald-500/20' : 'border-amber-500 bg-amber-500/5 shadow-amber-500/20'
                                }`}>
                                <span className="text-2xl font-bold text-white">{latestAIReview.score}</span>
                            </div>
                            <p className="text-gray-400 text-xs mb-4 font-medium">Quality Score</p>

                            <div className="w-full bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                    {latestAIReview.feedback || "No detailed feedback provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ASSIGNEE INFO --- */}
                <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {task.assignedTo?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="text-sm text-white font-bold">{task.assignedTo?.name || 'Unassigned'}</p>
                            <p className="text-xs text-gray-500">Assignee</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaskDetailPanel;