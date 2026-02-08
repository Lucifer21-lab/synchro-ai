import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WorkloadStatus = ({ tasks }) => {
    // UPDATED STATS LOGIC
    const stats = [
        {
            name: 'Pending',
            // Count tasks where the user hasn't accepted the invite yet
            count: tasks.filter(t => t.assignmentStatus === 'Pending').length,
            color: '#8b5cf6' // Purple
        },
        {
            name: 'To-Do',
            // Only count To-Do if the user has accepted (Active)
            // We also include !assignmentStatus to handle any legacy data without the field
            count: tasks.filter(t => t.status === 'To-Do' && (t.assignmentStatus === 'Active' || !t.assignmentStatus)).length,
            color: '#06b6d4' // Cyan
        },
        {
            name: 'In-Progress',
            count: tasks.filter(t => t.status === 'In-Progress').length,
            color: '#10b981' // Emerald
        },
        {
            name: 'Review',
            count: tasks.filter(t => t.status === 'Review-Requested').length,
            color: '#f59e0b' // Amber
        },
    ];

    return (
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">●</span> Workload Status
            </h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#374151' }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                            {stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {/* Legend / Counter below chart */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-400">
                {stats.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.name}: <span className="text-white font-medium">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkloadStatus;