import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import OverallProgress from '../components/dashboard/OverallProgress';
import WorkloadStatus from '../components/dashboard/WorkloadStatus';
import QuickStats from '../components/dashboard/QuickStats';
import {
    Search, Plus, Menu, Sparkles, LayoutGrid,
    List, CheckSquare, Activity
} from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext(); // Access global layout state

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projRes, taskRes, actRes] = await Promise.all([
                    api.get(`/projects/${id}`),
                    api.get(`/task/project/${id}`),
                    api.get(`/notifications/activity/${id}`)
                ]);
                setProject(projRes.data.data);
                setTasks(taskRes.data.data);
                setActivities(actRes.data.data);
            } catch (error) {
                console.error("Error loading project dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading Dashboard...</div>;
    if (!project) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Project not found</div>;

    return (
        <div className="flex-1 flex flex-col h-screen bg-[#0f172a] text-gray-300 font-sans overflow-hidden">

            {/* Top Navbar */}
            <header className="h-16 border-b border-gray-700 bg-[#1e293b] flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {/* Toggle Button - Only visible when sidebar is closed */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-[#0f172a] text-white rounded-lg hover:bg-indigo-600 transition"
                            title="Open Menu"
                        >
                            <Menu size={18} />
                        </button>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="hidden sm:inline">Projects</span>
                        <span className="hidden sm:inline">/</span>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {project.title.charAt(0)}
                            </div>
                            <span className="text-white font-medium text-lg">{project.title}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="bg-[#0f172a] border border-gray-600 text-sm text-white rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-lg shadow-cyan-500/20">
                        <Plus size={18} /> <span className="hidden sm:inline">New Task</span>
                    </button>
                </div>
            </header>

            {/* Main Dashboard Grid */}
            <main className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">

                    {/* LEFT COLUMN (Charts & Stats) */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Row 1: Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <OverallProgress tasks={tasks} />
                            <WorkloadStatus tasks={tasks} />
                        </div>

                        {/* Row 2: Timeline & Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Monitoring Timeline */}
                            <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-gray-200 font-semibold flex items-center gap-2">
                                        <Activity size={18} className="text-indigo-400" /> Activity Log
                                    </h3>
                                    <span className="text-xs text-gray-500 cursor-pointer hover:text-white">View All</span>
                                </div>

                                <div className="space-y-6 pl-2 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-700/50"></div>

                                    {activities.slice(0, 5).map((act, idx) => (
                                        <div key={idx} className="flex gap-4 relative z-10">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-[#0f172a] border-2 border-gray-600 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {act.user?.name?.charAt(0) || 'U'}
                                                </div>
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-sm text-gray-300 leading-snug">
                                                    <span className="font-semibold text-white">{act.user?.name}</span> <span className="text-gray-400">{act.action}</span>
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-1">
                                                    {new Date(act.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {activities.length === 0 && <p className="text-gray-500 text-sm italic pl-4">No recent activity.</p>}
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <QuickStats tasks={tasks} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN (AI Sidebar) */}
                    <div className="xl:col-span-1 space-y-6">

                        {/* AI Pulse Card */}
                        <div className="bg-[#1e293b] border border-indigo-500/30 p-6 rounded-xl relative overflow-hidden shadow-xl shadow-indigo-900/10">
                            {/* Glowing Background Effect */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 blur-[80px] opacity-20 pointer-events-none"></div>

                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Sparkles className="text-indigo-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">AI Project Pulse</h3>
                                    <p className="text-xs text-indigo-300">Real-time insights</p>
                                </div>
                            </div>

                            {/* AI Summary Box */}
                            <div className="bg-[#0f172a]/80 p-4 rounded-lg border border-indigo-500/20 mb-6 backdrop-blur-sm relative z-10">
                                <p className="text-indigo-100 text-sm leading-relaxed">
                                    {project.aiSummary || "AI is analyzing your project data. Add tasks and invite members to generate the first insights."}
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-5 relative z-10">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Team Velocity</p>
                                        <span className="text-xs text-emerald-400 font-mono">High</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-3">Detected Risks</p>
                                    <div className="space-y-2">
                                        <RiskItem title="Backend Bottleneck" desc="3 API tasks pending review" color="bg-red-500" />
                                        <RiskItem title="Deadline Approaching" desc="Sprint ends in 2 days" color="bg-orange-500" />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/20">
                                Generate New Report
                            </button>
                        </div>

                        {/* Team Members List (Mini) */}
                        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700">
                            <h3 className="text-gray-200 font-semibold mb-4 text-sm uppercase">Team Members</h3>
                            <div className="space-y-3">
                                {project.members.map((member, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white border border-gray-600">
                                                {member.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-300 font-medium group-hover:text-white transition">{member.user?.name}</p>
                                                <p className="text-[10px] text-gray-500">{member.role}</p>
                                            </div>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded-lg text-xs font-medium transition">
                                Manage Team
                            </button>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

// Helper Component for Risks
const RiskItem = ({ title, desc, color }) => (
    <div className="bg-[#0f172a] p-3 rounded-lg flex items-start gap-3 border border-gray-700/50 hover:border-gray-600 transition">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`}></div>
        <div>
            <p className="text-sm text-gray-200 font-medium">{title}</p>
            <p className="text-xs text-gray-500 leading-tight">{desc}</p>
        </div>
    </div>
);

export default ProjectDetails;