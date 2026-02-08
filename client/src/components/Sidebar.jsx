import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Folder, CheckSquare, Settings, X, LogOut } from 'lucide-react'; // Changed List to Folder
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // CSS classes for the sidebar transition
    const sidebarClasses = `
    fixed top-0 left-0 h-full bg-[#1e293b] border-r border-gray-700 w-64 z-50
    transform transition-transform duration-300 ease-in-out shadow-2xl
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

    return (
        <aside className={sidebarClasses}>
            {/* Header with Close Button */}
            <div className="p-6 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3 text-white font-bold text-xl">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">S</div>
                    Synchro-AI
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition p-1 rounded-md hover:bg-gray-700"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 mt-6">
                <NavItem
                    to="/"
                    icon={<LayoutGrid size={20} />}
                    label="Dashboard"
                    active={isActive('/')}
                />

                {/* UPDATED LINK */}
                <NavItem
                    to="/my-projects"
                    icon={<Folder size={20} />}
                    label="My Projects"
                    active={isActive('/my-projects')}
                />

                <NavItem
                    to="/kanban"
                    icon={<CheckSquare size={20} />}
                    label="Kanban Board"
                    active={isActive('/kanban')}
                />

                <NavItem
                    to="/settings"
                    icon={<Settings size={20} />}
                    label="Settings"
                    active={isActive('/settings')}
                />
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-gray-700 absolute bottom-0 w-full">
                <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm text-white font-medium truncate w-24">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate w-24">Developer</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="text-gray-500 hover:text-red-400 transition"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

// Helper Component for Links
const NavItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`
      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
      ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }
    `}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

export default Sidebar;