import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import {
    Plus, Folder, Clock, Menu, Search, Bell,
    MoreVertical, ArrowRight, Activity
} from 'lucide-react';

const Dashboard = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext();

    // State for data
    const [projects, setProjects] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State - Matches backend requirements
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        aiApiKey: '' // Backend: projects.controller.js line 7
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes, tasksRes] = await Promise.all([
                api.get('/projects'),
                api.get('/task/user/me')
            ]);
            setProjects(projectsRes.data?.data || []);
            setMyTasks(tasksRes.data?.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER: Matches 'createProject' in projects.controller.js ---
    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            // 1. Send Request (Title, Description, AI Key)
            const { data } = await api.post('/projects', newProject);

            // 2. Update UI with the response from backend (projects.controller.js line 35)
            // We prepend the new project to the list so it appears first
            setProjects([data.data, ...projects]);

            // 3. Reset and Close
            setShowModal(false);
            setNewProject({ title: '', description: '', aiApiKey: '' });

        } catch (err) {
            alert(err.response?.data?.message || "Failed to create project");
        }
    };

    const stats = {
        activeProjects: projects.filter(p => p.status === 'Active').length, // Matches Project.js enum
        pendingTasks: myTasks.filter(t => t.status !== 'Merged').length,
        completedTasks: myTasks.filter(t => t.status === 'Merged').length,
        teamLoad: myTasks.length > 0
            ? Math.round((myTasks.filter(t => t.status === 'In-Progress').length / myTasks.length) * 100)
            : 0
    };

    if (loading) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0f172a] text-gray-300 font-sans">

            {/* HEADER */}
            <header className="h-20 border-b border-gray-800 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {!isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#1e293b] text-white rounded-lg hover:bg-indigo-600 transition">
                            <Menu size={20} />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-white">Dashboard</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input type="text" placeholder="Search..." className="bg-[#1e293b] border border-gray-700 text-sm text-white rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 transition" />
                    </div>
                    <button className="relative text-gray-400 hover:text-white transition">
                        <Bell size={20} />
                        {stats.pendingTasks > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
                    <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-900/20 transition">
                        <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="p-6 space-y-8 flex-1 overflow-y-auto">

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Active Projects" value={stats.activeProjects} icon={<Folder size={24} />} color="text-indigo-400" bg="bg-indigo-500/10" />
                    <StatCard label="Pending Tasks" value={stats.pendingTasks} icon={<Clock size={24} />} color="text-yellow-400" bg="bg-yellow-500/10" />
                    <StatCard label="Completed" value={stats.completedTasks} icon={<Activity size={24} />} color="text-emerald-400" bg="bg-emerald-500/10" />
                    <StatCard label="Team Load" value={`${stats.teamLoad}%`} icon={<Activity size={24} />} color="text-cyan-400" bg="bg-cyan-500/10" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* PROJECTS GRID */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Your Workspaces ({projects.length})</h2>
                            <Link to="/projects" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {projects.map((project) => (
                                <Link
                                    key={project._id}
                                    to={`/project/${project._id}`}
                                    className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 hover:shadow-lg transition group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                                            <Folder size={24} />
                                        </div>
                                        <button className="text-gray-500 hover:text-white"><MoreVertical size={18} /></button>
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-2 truncate">{project.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">{project.description || "No description provided."}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                        <div className="flex -space-x-2">
                                            {(project.members || []).slice(0, 3).map((m, i) => (
                                                <div key={i} className="w-7 h-7 rounded-full bg-gray-700 border-2 border-[#1e293b] flex items-center justify-center text-[10px] text-white">
                                                    {m.user?.name?.charAt(0) || '?'}
                                                </div>
                                            ))}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full border ${project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                                            {project.status || 'Planning'}
                                        </span>
                                    </div>
                                </Link>
                            ))}

                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-[#1e293b]/50 p-6 rounded-xl border-2 border-dashed border-gray-700 hover:border-indigo-500/50 hover:bg-[#1e293b] transition flex flex-col items-center justify-center text-gray-500 hover:text-indigo-400 gap-3 min-h-[200px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <span className="font-medium">Create New Workspace</span>
                            </button>
                        </div>
                    </div>

                    {/* TASKS LIST */}
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 h-fit">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">My Priorities ({myTasks.length})</h2>
                            <Link to="/my-tasks" className="text-xs text-indigo-400 hover:underline">View Kanban</Link>
                        </div>
                        <div className="p-4 space-y-1">
                            {myTasks.slice(0, 5).map((task) => (
                                <div key={task._id} className="p-3 rounded-lg hover:bg-gray-700/50 transition flex items-start gap-3 group cursor-pointer">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${task.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-indigo-400 transition">{task.title}</h4>
                                        <p className="text-xs text-gray-500 truncate">{task.project?.title || 'Unknown Project'}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{task.status}</span>
                                </div>
                            ))}
                            {myTasks.length === 0 && (
                                <div className="p-4 text-center text-gray-500 text-sm">No tasks assigned to you.</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* CREATE WORKSPACE MODAL - Maps fields to Backend Model */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Create Workspace</h3>

                        <form onSubmit={handleCreateProject} className="space-y-4">
                            {/* Field 1: Title (Required by Project Model) */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Project Title *</label>
                                <input
                                    className="w-full p-2.5 bg-[#0f172a] border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                    value={newProject.title}
                                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    placeholder="e.g. Website Redesign"
                                    required
                                />
                            </div>

                            {/* Field 2: Description (Optional) */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    className="w-full p-2.5 bg-[#0f172a] border border-gray-600 rounded-lg text-white h-24 focus:border-indigo-500 focus:outline-none resize-none"
                                    value={newProject.description}
                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                    placeholder="What is this project about?"
                                />
                            </div>

                            {/* Field 3: AI API Key (Optional - Encrypted by Backend) */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Gemini API Key <span className="text-xs text-gray-500">(Optional for AI features)</span>
                                </label>
                                <input
                                    type="password"
                                    className="w-full p-2.5 bg-[#0f172a] border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                    value={newProject.aiApiKey}
                                    onChange={e => setNewProject({ ...newProject, aiApiKey: e.target.value })}
                                    placeholder="Paste your key here"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition shadow-lg shadow-indigo-900/20">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon, color, bg }) => (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export default Dashboard;