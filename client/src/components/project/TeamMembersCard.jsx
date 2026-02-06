import { User, Shield, Settings } from 'lucide-react';

const TeamMembersCard = ({ activeMembers, onManageTeamClick }) => {
    return (
        <div className="bg-[#1e293b] rounded-2xl border border-gray-700 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Team Members</h3>
            </div>
            <div className="p-2 max-h-[350px] overflow-y-auto">
                {activeMembers.map((member) => (
                    <div key={member.user._id} className="flex items-center justify-between p-3 hover:bg-[#2a3655]/30 rounded-xl transition group">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-[#1e293b] flex items-center justify-center overflow-hidden">
                                    {member.user.avatar ? <img src={member.user.avatar} className="w-full h-full object-cover" /> : <User size={18} className="text-gray-400" />}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1e293b] rounded-full"></div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{member.user.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        {member.role === 'Owner' ? <Shield size={10} className="text-yellow-500" /> : <User size={10} />}
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-gray-700/50 mt-auto">
                <button
                    onClick={onManageTeamClick}
                    className="w-full py-2 border border-gray-600 rounded-lg text-sm text-gray-300 font-medium hover:bg-gray-700 hover:text-white transition flex items-center justify-center gap-2"
                >
                    <Settings size={16} /> Manage Team
                </button>
            </div>
        </div>
    );
};

export default TeamMembersCard;