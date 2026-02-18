import { Users, UserPlus } from 'lucide-react';

const TeamMembersCard = ({ activeMembers, onManageTeamClick }) => {
    return (
        <div className="bg-[#1e293b] rounded-2xl border border-gray-700 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Users size={18} className="text-indigo-400" /> Team
                </h3>
                <button
                    onClick={onManageTeamClick}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-indigo-400 transition"
                >
                    <UserPlus size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {activeMembers.map((member) => (
                    <div key={member.user._id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Avatar logic: Show Image if exists, else first letter */}
                            {member.user.avatar ? (
                                <img src={member.user.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-600" alt="" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                                    {member.user.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {/* Truncate ensures name doesn't push other elements */}
                            <div className="min-w-0">
                                <p className="text-sm text-gray-200 font-medium truncate">{member.user.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{member.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamMembersCard;