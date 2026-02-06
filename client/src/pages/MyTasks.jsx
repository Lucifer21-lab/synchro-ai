import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/kanban/TaskCard';
import TaskDetailPanel from '../components/kanban/TaskDetailPanel';
import { Menu, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const MyTasks = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // Columns for standard Kanban
    const columns = { 'To-Do': [], 'In-Progress': [], 'Review-Requested': [], 'Merged': [] };
    // Separate list for invites
    const pendingTasks = [];

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/task/user/me');
            setTasks(data.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Filter tasks logic
    tasks.forEach(task => {
        if (task.assignmentStatus === 'Pending') {
            pendingTasks.push(task);
        } else if (columns[task.status] && (task.assignmentStatus === 'Accepted' || !task.assignmentStatus)) {
            // Include if Accepted OR if assignmentStatus is missing (legacy tasks)
            columns[task.status].push(task);
        }
    });

    // Accept/Decline Handler
    const handleResponse = async (taskId, response) => {
        try {
            await api.post(`/task/${taskId}/respond`, { response });
            fetchTasks(); // Refresh to move task or remove it
            alert(`Task ${response}ed successfully`);
        } catch (err) {
            alert(err.response?.data?.message || "Action failed");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh)] bg-[#0f172a] text-gray-300 relative overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#0f172a] flex-shrink-0">
                <div className="flex items-center gap-4">
                    {!isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#1e293b] rounded-lg hover:bg-indigo-600 transition text-white">
                            <Menu size={20} />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-white">My Tasks</h1>
                </div>
            </div>

            {/* Board Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedTask ? 'mr-[400px]' : ''}`}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">

                    {/* --- PENDING INVITATIONS SECTION --- */}
                    {pendingTasks.length > 0 && (
                        <div className="mb-8 p-6 bg-[#1e293b]/50 border border-yellow-500/20 rounded-xl animate-in fade-in slide-in-from-top-4">
                            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-yellow-500" />
                                Pending Invitations ({pendingTasks.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingTasks.map(task => (
                                    <div key={task._id} className="bg-[#0f172a] border border-gray-700 p-5 rounded-lg shadow-lg flex flex-col gap-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg leading-tight">{task.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">Project: <span className="text-indigo-400">{task.project?.title || 'Unknown Project'}</span></p>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>

                                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleResponse(task._id, 'accept'); }}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-bold transition shadow-lg shadow-emerald-900/20"
                                            >
                                                <CheckCircle2 size={16} /> Accept
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleResponse(task._id, 'decline'); }}
                                                className="flex-1 bg-gray-800 hover:bg-red-600 hover:text-white text-gray-400 py-2 rounded flex items-center justify-center gap-2 text-sm font-bold transition border border-gray-700 hover:border-red-600"
                                            >
                                                <XCircle size={16} /> Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Standard Kanban Board */}
                    <div className="flex gap-6 h-full min-w-[1000px]">
                        {Object.keys(columns).map((status) => (
                            <div key={status} className="flex-1 flex flex-col min-w-[280px]">
                                <div className="flex justify-between items-center mb-4 px-4 py-3 bg-[#1e293b] rounded-lg border border-gray-700 sticky top-0 z-10">
                                    <h3 className="font-bold text-sm text-white">{status}</h3>
                                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{columns[status].length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
                                    {columns[status].map((task) => (
                                        <TaskCard key={task._id} task={task} onClick={setSelectedTask} />
                                    ))}
                                    {columns[status].length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                                            No Tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Details Panel */}
            {selectedTask && (
                <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    );
};

export default MyTasks;