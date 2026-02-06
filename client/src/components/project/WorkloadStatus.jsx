const WorkloadStatus = ({ tasksByStatus, totalTasks }) => {
    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium mb-4">Workload Status</h3>
            <div className="space-y-4">
                {/* To Do */}
                <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">To Do</span><span className="text-gray-400">{tasksByStatus.todo} tasks</span></div>
                    <div className="h-1.5 bg-gray-700 rounded-full">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${totalTasks ? (tasksByStatus.todo / totalTasks) * 100 : 0}%` }}></div>
                    </div>
                </div>
                {/* In Progress */}
                <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">In Progress</span><span className="text-indigo-400">{tasksByStatus.inprogress} tasks</span></div>
                    <div className="h-1.5 bg-gray-700 rounded-full">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalTasks ? (tasksByStatus.inprogress / totalTasks) * 100 : 0}%` }}></div>
                    </div>
                </div>
                {/* Review */}
                <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Under Review</span><span className="text-cyan-400">{tasksByStatus.submitted} tasks</span></div>
                    <div className="h-1.5 bg-gray-700 rounded-full">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${totalTasks ? (tasksByStatus.submitted / totalTasks) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkloadStatus;