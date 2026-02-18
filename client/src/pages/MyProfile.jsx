import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Save, Briefcase, Link as LinkIcon, Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const MyProfile = () => {
    const { user, updateUserProfile } = useAuth();
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        avatar: user?.avatar || '',
        skills: user?.skills?.join(', ') || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
            await updateUserProfile({
                ...formData,
                skills: skillsArray
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-gray-300 font-sans">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-4 bg-[#0f172a] shrink-0">
                {!isSidebarOpen && (
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#1e293b] rounded-lg hover:bg-indigo-600 transition text-white">
                        <Menu size={20} />
                    </button>
                )}
                <h1 className="text-xl font-bold text-white">My Profile</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto bg-[#1e293b] rounded-xl border border-gray-700 p-8 shadow-2xl">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden border-4 border-[#0f172a]">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || 'U'
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                            <p className="text-gray-400">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                                {user?.isVerified ? 'Verified Account' : 'Unverified'}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <LinkIcon size={16} /> Avatar URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <Mail size={16} /> Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                className="w-full bg-[#0f172a]/50 border border-gray-700 rounded-lg p-3 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <Briefcase size={16} /> Skills (comma separated)
                            </label>
                            <textarea
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                placeholder="React, Node.js, Design..."
                                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-24 resize-none transition"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;