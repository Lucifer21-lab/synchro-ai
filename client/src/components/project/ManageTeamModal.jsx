import { X, Trash2, AlertCircle } from 'lucide-react';

const ManageTeamModal = ({ isOpen, onClose, members, currentUser, isOwner, onRemoveMember, onDeleteProjectClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="text-xl font-bold text-white">Manage Team</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {members.map(m => (
                        <div key={m.user._id} className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white border border-gray-600">
                                    {m.user.name.charAt(0)}
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

                <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-500">Only project owners can remove team members.</p>
                </div>

                {isOwner && (
                    <div className="mt-8 pt-6 border-t border-red-500/20">
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