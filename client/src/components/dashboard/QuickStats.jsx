const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4 border border-gray-600">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const QuickStats = ({ tasks }) => {
    const dueToday = tasks.filter(t => {
        if (!t.deadline) return false;
        return new Date(t.deadline).toDateString() === new Date().toDateString();
    }).length;

    const completedWeek = tasks.filter(t => t.status === 'Merged').length; // Simplified logic

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-4">
            <h3 className="text-gray-200 font-semibold mb-2">Quick Stats</h3>
            <StatCard
                label="Tasks Due Today"
                value={dueToday}
                icon="📅"
                color="bg-yellow-500/20 text-yellow-500"
            />
            <StatCard
                label="Completed This Week"
                value={completedWeek}
                icon="✅"
                color="bg-green-500/20 text-green-500"
            />
            <StatCard
                label="Active Team Members"
                value="3"
                icon="👥"
                color="bg-blue-500/20 text-blue-500"
            />
        </div>
    );
};

export default QuickStats;