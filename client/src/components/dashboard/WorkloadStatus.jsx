import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WorkloadStatus = ({ tasks }) => {
    const stats = [
        { name: 'To-Do', count: tasks.filter(t => t.status === 'To-Do').length, color: '#06b6d4' },
        { name: 'In-Progress', count: tasks.filter(t => t.status === 'In-Progress').length, color: '#10b981' },
        { name: 'Review', count: tasks.filter(t => t.status === 'Review-Requested').length, color: '#f59e0b' },
    ];

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">●</span> Workload Status
            </h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: '#374151' }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                            {stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
                {stats.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.name}: {item.count}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkloadStatus;