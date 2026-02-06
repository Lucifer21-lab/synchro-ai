import { Link } from 'react-router-dom';
import { Search, Plus, MoreVertical, ChevronRight } from 'lucide-react';

const ProjectHeader = ({ projectTitle, onNewTaskClick }) => {
    return (
        <header className="h-16 border-b border-gray-800 bg-[#0f172a]/95 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link to="/" className="hover:text-white transition">Projects</Link>
                <ChevronRight size={14} />
                <span className="text-white font-medium truncate max-w-[200px]">{projectTitle}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="bg-[#1e293b] border border-gray-700 text-sm text-white rounded-full pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 transition"
                    />
                </div>

                <button
                    onClick={onNewTaskClick}
                    className="bg-cyan-500 hover:bg-cyan-600 text-[#0f172a] px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-cyan-500/20 transition"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">New Task</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800">
                    <MoreVertical size={20} />
                </button>
            </div>
        </header>
    );
};

export default ProjectHeader;