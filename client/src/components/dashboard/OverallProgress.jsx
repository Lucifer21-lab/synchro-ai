import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const OverallProgress = ({ tasks }) => {
    const completed = tasks.filter(t => t.status === 'Merged').length;
    const total = tasks.length || 1; // Avoid division by zero
    const percentage = Math.round((completed / total) * 100);

    const data = [
        { name: 'Completed', value: percentage },
        { name: 'Remaining', value: 100 - percentage },
    ];
    const COLORS = ['#10B981', '#374151']; // Green & Dark Gray

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
                <span className="text-green-400">📈</span> Overall Progress
            </h3>
            <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{percentage}%</span>
                    <span className="text-xs text-gray-400">Complete</span>
                </div>
            </div>
            <p className="text-center text-gray-400 text-sm mt-2">Project completion status</p>
        </div>
    );
};

export default OverallProgress;