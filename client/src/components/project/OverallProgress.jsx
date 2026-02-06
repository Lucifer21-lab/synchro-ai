import { Clock } from 'lucide-react';

const OverallProgress = ({ progressPercentage, completedTasks, totalTasks }) => {
    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={80} className="text-indigo-500" /></div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Overall Progress</h3>
            <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold text-white">{progressPercentage}%</span>
                <span className="text-indigo-400 text-sm mb-1">Completed</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-400">
                <span>{completedTasks} completed</span>
                <span>{totalTasks - completedTasks} remaining</span>
            </div>
        </div>
    );
};

export default OverallProgress;