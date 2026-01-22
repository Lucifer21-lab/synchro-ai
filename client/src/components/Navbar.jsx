import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    // Don't render the navbar if no user is logged in
    if (!user) return null;

    return (
        <nav className="bg-[#1e293b] border-b border-gray-700 sticky top-0 z-50 shadow-md">
            <div className="px-6 py-3 flex justify-between items-center">

                {/* Logo / Brand Section */}
                <Link to="/" className="flex items-center gap-3 text-white font-bold text-xl hover:opacity-90 transition">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        S
                    </div>
                    <span className="tracking-tight">Synchro-AI</span>
                </Link>

                {/* Right Side: User Profile & Actions */}
                <div className="flex items-center gap-6">

                    {/* User Info */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white leading-tight">
                                {user.name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                Active Member
                            </p>
                        </div>

                        {/* Avatar Circle */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-[#1e293b]">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors group bg-gray-800/50 hover:bg-gray-800 px-3 py-2 rounded-lg"
                        title="Logout"
                    >
                        <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;