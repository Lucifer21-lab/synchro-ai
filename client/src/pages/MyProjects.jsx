import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Menu, Folder, Shield, PenTool, Eye, ExternalLink } from 'lucide-react';

const MyProjects = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data } = await api.get('/projects');
                setProjects(data.data);
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Helper to determine the User's Role in a specific project
    const getMyRole = (project) => {
        if (project.owner._id === user?._id) return 'Owner';
        const member = project.members.find(m => m.user?._id === user?._id);
        return member ? member.role : 'Viewer';
    };

    // Categorize Projects
    const categories = {
        Owned: projects.filter(p => getMyRole(p) === 'Owner'),
        'Co-Owned': projects.filter(p => getMyRole(p) === 'Admin'), // Assuming Admin = Co-Owned
        Contributor: projects.filter(p => getMyRole(p) === 'Contributor'),
        Viewer: projects.filter(p => getMyRole(p) === 'Viewer'),
    };

    const categoryConfig = {
        Owned: { icon: Folder, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
        'Co-Owned': { icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
        Contributor: { icon: PenTool, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
        Viewer: { icon: Eye, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-600/30' },
    };

    if (loading) return <div className="p-10 text-white animate-pulse">Loading Projects...</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-gray-300 overflow-hidden font-sans">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-4 bg-[#0f172a] shrink-0">
                {!isSidebarOpen && (
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#1e293b] rounded-lg hover:bg-indigo-600 transition text-white">
                        <Menu size={20} />
                    </button>
                )}
                <h1 className="text-xl font-bold text-white">My Projects</h1>
            </div>

            {/* 2x2 Grid Layout */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto h-full min-h-[600px]">
                    {Object.keys(categories).map((key) => {
                        const Config = categoryConfig[key];
                        const Icon = Config.icon;
                        const list = categories[key];

                        return (
                            <div key={key} className={`flex flex-col rounded-xl border ${Config.border} ${Config.bg} overflow-hidden shadow-xl`}>
                                {/* Card Header */}
                                <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-[#0f172a]/40 backdrop-blur">
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className={Config.color} />
                                        <h2 className="text-lg font-bold text-white tracking-wide uppercase">{key}</h2>
                                    </div>
                                    <span className="bg-[#0f172a] text-white text-xs font-bold px-3 py-1 rounded-full border border-gray-700">
                                        {list.length}
                                    </span>
                                </div>

                                {/* Project List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {list.length > 0 ? (
                                        list.map(project => (
                                            <Link
                                                to={`/project/${project._id}`}
                                                key={project._id}
                                                className="block group relative"
                                            >
                                                <div className="bg-[#1e293b] border border-gray-700 hover:border-indigo-500 rounded-lg p-4 transition-all hover:translate-x-1 hover:shadow-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-white font-bold group-hover:text-indigo-400 transition">
                                                                {project.title}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{project.description || 'No description'}</p>
                                                        </div>
                                                        <ExternalLink size={14} className="text-gray-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                            <p className="text-sm italic">No {key} projects</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyProjects;