import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/kanban/TaskCard';
import TaskDetailPanel from '../components/kanban/TaskDetailPanel';
import { Search, SlidersHorizontal, Menu, Plus } from 'lucide-react';

const Kanban = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);

    // Define Columns
    const columns = {
        'To-Do': [],
        'In-Progress': [],
        'Review-Requested': [],
        'Merged': []
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Fetching user tasks for the board. 
                // You can change this to '/task' if you want ALL project tasks.
                const { data } = await api.get('/task/user/me');
                setTasks(data.data);
            } catch (error) {
                console.error("Failed to load tasks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // Distribute tasks
    tasks.forEach(task => {
        if (columns[task.status]) {
            columns[task.status].push(task);
        }
    });

    const columnColors = {
        'To-Do': 'border-t-gray-500',
        'In-Progress': 'border-t-cyan-500',
        'Review-Requested': 'border-t-yellow-500',
        'Merged': 'border-t-emerald-500',
    };

    if (loading) return <div className="p-10 text-white">Loading Board...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh)] bg-[#0f172a] text-gray-300 relative overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#0f172a] flex-shrink-0">
                <div className="flex items-center gap-4">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-[#1e293b] text-white rounded-lg hover:bg-indigo-600 transition"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-white">Kanban Board</h1>
                </div>

                <div className="flex gap-3">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            placeholder="Search tasks..."
                            className="bg-[#1e293b] border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 w-64 text-white"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition">
                        <Plus size={16} /> <span className="hidden sm:inline">Add Task</span>
                    </button>
                </div>
            </div>

            {/* Board Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedTask ? 'mr-[400px]' : ''}`}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <div className="flex gap-6 h-full min-w-[1000px]">
                        {Object.keys(columns).map((status) => (
                            <div key={status} className="flex-1 flex flex-col min-w-[280px]">
                                {/* Column Header */}
                                <div className={`flex justify-between items-center mb-4 px-4 py-3 bg-[#1e293b] rounded-lg border-t-4 ${columnColors[status]} border-x border-b border-gray-700`}>
                                    <h3 className="font-bold text-sm text-white">{status}</h3>
                                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                                        {columns[status].length}
                                    </span>
                                </div>

                                {/* Task List */}
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {columns[status].map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onClick={setSelectedTask}
                                        />
                                    ))}
                                    {columns[status].length === 0 && (
                                        <div className="border-2 border-dashed border-gray-800 rounded-xl h-24 flex items-center justify-center text-gray-600 text-sm">
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Details Panel Slide-over */}
            {selectedTask && (
                <TaskDetailPanel
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
};

export default Kanban;