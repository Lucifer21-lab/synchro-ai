import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; // Import context
import api from '../api/axios';
import TaskCard from '../components/kanban/TaskCard';
import TaskDetailPanel from '../components/kanban/TaskDetailPanel';
import { Search, SlidersHorizontal, Menu } from 'lucide-react'; // Import Menu

const MyTasks = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext(); // Use context
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    const columns = { 'To-Do': [], 'In-Progress': [], 'Review-Requested': [], 'Merged': [] };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await api.get('/task/user/me');
                setTasks(data.data);
            } catch (error) { console.error(error); }
        };
        fetchTasks();
    }, []);

    tasks.forEach(task => { if (columns[task.status]) columns[task.status].push(task); });

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

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input placeholder="Search tasks..." className="bg-[#1e293b] border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none w-64" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-sm hover:text-white transition">
                        <SlidersHorizontal size={16} /> Sort
                    </button>
                </div>
            </div>

            {/* Board */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedTask ? 'mr-[400px]' : ''}`}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <div className="flex gap-6 h-full min-w-[1000px]">
                        {Object.keys(columns).map((status) => (
                            <div key={status} className="flex-1 flex flex-col min-w-[280px]">
                                <div className="flex justify-between items-center mb-4 px-4 py-3 bg-[#1e293b] rounded-lg border border-gray-700">
                                    <h3 className="font-bold text-sm text-white">{status}</h3>
                                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{columns[status].length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {columns[status].map((task) => (
                                        <TaskCard key={task._id} task={task} onClick={setSelectedTask} />
                                    ))}
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