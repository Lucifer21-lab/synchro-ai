import { Link } from 'react-router-dom';
import { Search, Plus, MoreVertical, ChevronRight } from 'lucide-react';

const ProjectHeader = ({ projectTitle, onNewTaskClick, isOwner }) => { // <--- Add isOwner prop
    return (
        <header className="h-16 border-b border-gray-800 bg-[#0f172a]/95 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10">
            {/* ... (Left side remains same) ... */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link to="/" className="hover:text-white transition">Projects</Link>
                <ChevronRight size={14} />
                <span className="text-white font-medium truncate max-w-[200px]">{projectTitle}</span>
            </div>

            <div className="flex items-center gap-4">
                {/* ... (Search bar remains same) ... */}
                <div className="relative hidden md:block">
                    {/* ... search input code ... */}
                </div>

                {/* CONDITIONAL RENDERING FOR NEW TASK BUTTON */}
                {isOwner && (
                    <button
                        onClick={onNewTaskClick}
                        className="bg-cyan-500 hover:bg-cyan-600 text-[#0f172a] px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-cyan-500/20 transition"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">New Task</span>
                    </button>
                )}

                <button className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800">
                    <MoreVertical size={20} />
                </button>
            </div>
        </header>
    );
};

export default ProjectHeader;