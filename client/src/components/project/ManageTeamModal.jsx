import { useState } from 'react'; // Import useState
import { X, Trash2, AlertCircle, UserPlus, Mail } from 'lucide-react';

const ManageTeamModal = ({ isOpen, onClose, members, currentUser, isOwner, onRemoveMember, onInvite, onDeleteProjectClick }) => {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Contributor');
    const [isInviting, setIsInviting] = useState(false);

    if (!isOpen) return null;

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(true);
        try {
            await onInvite(inviteEmail, inviteRole);
            setInviteEmail(''); // Clear input on success
        } catch (error) {
            console.error("Invite failed", error);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="text-xl font-bold text-white">Manage Team</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>

                {/* --- NEW: INVITE SECTION --- */}
                <form onSubmit={handleInviteSubmit} className="mb-6 p-4 bg-[#0f172a] rounded-lg border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                        <UserPlus size={16} className="text-cyan-400" /> Invite New Member
                    </h4>
                    <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                            <Mail size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="email"
                                placeholder="colleague@example.com"
                                className="w-full bg-[#1e293b] border border-gray-600 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-cyan-500 outline-none"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                        </div>
                        <select
                            className="bg-[#1e293b] border border-gray-600 rounded-lg px-2 text-sm text-white focus:border-cyan-500 outline-none"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                        >
                            <option value="Contributor">Contributor</option>
                            <option value="Viewer">Viewer</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isInviting}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                    >
                        {isInviting ? 'Sending Invite...' : 'Send Invitation'}
                    </button>
                </form>

                {/* --- EXISTING MEMBER LIST --- */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {members.map(m => (
                        <div key={m.user._id} className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-700">
                            {/* ... (Keep existing member list code exactly as is) ... */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white border border-gray-600">
                                    <p className="text-white font-medium text-sm">{m.user?.name || 'Unknown User'}</p>
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{m.user.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {m.role} • <span className={m.status === 'Active' ? 'text-emerald-400' : 'text-yellow-400'}>{m.status}</span>
                                    </p>
                                </div>
                            </div>

                            {isOwner && m.user._id !== currentUser._id && m.role !== 'Owner' ? (
                                <button
                                    onClick={() => onRemoveMember(m.user._id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                                    title="Remove User"
                                >
                                    <Trash2 size={16} />
                                </button>
                            ) : (
                                <span className="text-xs text-gray-600 italic px-2">{m.role === 'Owner' ? 'Owner' : ''}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* ... (Keep existing footer/danger zone code) ... */}
                <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-500">Only project owners can remove team members.</p>
                </div>

                {isOwner && (
                    <div className="mt-8 pt-6 border-t border-red-500/20">
                        {/* ... (Keep existing Danger Zone code) ... */}
                        <h4 className="text-red-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                            <AlertCircle size={12} /> Danger Zone
                        </h4>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-3">
                                Permanently delete this workspace, tasks, and activity history. This action cannot be undone.
                            </p>
                            <button
                                onClick={onDeleteProjectClick}
                                className="w-full bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 border border-red-500/50"
                            >
                                <Trash2 size={16} /> Delete Workspace
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTeamModal;