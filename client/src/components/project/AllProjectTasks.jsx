import { useState } from 'react';
import { AlertCircle, Clock, UserX, User } from 'lucide-react';
import TaskDetailPanel from '../kanban/TaskDetailPanel'; // Ensure path is correct

const AllProjectTasks = ({ tasks, isOwner, onTaskUpdate }) => {
    const [selectedTask, setSelectedTask] = useState(null);

    // Logic to determine what to show in the Status Column
    const getStatusDisplay = (task) => {
        if (!task.assignedTo) {
            return {
                type: 'special',
                label: 'Yet to Assign',
                color: 'text-gray-400 bg-gray-700/30 border-gray-600',
                icon: UserX
            };
        }

        if (task.assignmentStatus === 'Pending') {
            return {
                type: 'special',
                label: 'Yet to Accept',
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                icon: Clock
            };
        }

        return {
            type: 'standard',
            label: task.status
        };
    };

    // 1. Define Priority Weights for Sorting
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };

    // 2. Group and Sort Tasks
    const statusOrder = ['Submitted', 'In-Progress', 'To-Do', 'Merged'];

    const visibleTasks = tasks.filter(t => t.assignmentStatus !== 'Declined');

    // Group tasks by status
    const groupedTasks = statusOrder.reduce((acc, status) => {
        const tasksInStatus = visibleTasks
            .filter(t => t.status === status)
            .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]); // Sort by priority inside status

        if (tasksInStatus.length > 0) acc[status] = tasksInStatus;
        return acc;
    }, {});

    if (!isOwner) return null;

    return (
        <div className="bg-[#1e293b] rounded-2xl border border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6 shadow-xl relative">
            {/* Header */}
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertCircle size={18} className="text-indigo-400" />
                    All Project Tasks
                    <span className="text-xs font-normal text-gray-500 ml-2">(Click task to review)</span>
                </h3>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                    {visibleTasks.length} Active
                </span>
            </div>

            {/* Table */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {visibleTasks.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-700/50 sticky top-0 bg-[#1e293b] z-10">
                                <th className="p-4 font-medium">Task Details</th>
                                <th className="p-4 font-medium">Assignee</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {visibleTasks.map(task => {
                                const statusDisplay = getStatusDisplay(task);

                                return (
                                    <tr
                                        key={task._id}
                                        onClick={() => setSelectedTask(task)}
                                        className="hover:bg-indigo-500/10 transition group cursor-pointer"
                                    >
                                        {/* Task Title & Desc */}
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-gray-200 group-hover:text-indigo-400 transition">{task.title}</p>
                                            <p className="text-[10px] text-gray-500 line-clamp-1">{task.description}</p>
                                        </td>

                                        {/* Assignee */}
                                        <td className="p-4">
                                            {task.assignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white shrink-0">
                                                        {task.assignedTo.name?.charAt(0) || <User size={12} />}
                                                    </div>
                                                    <span className="text-xs text-gray-400 truncate max-w-[80px]">
                                                        {task.assignedTo.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-600 italic flex items-center gap-1">
                                                    <UserX size={12} /> Unassigned
                                                </span>
                                            )}
                                        </td>

                                        {/* Status Column */}
                                        <td className="p-4">
                                            {statusDisplay.type === 'special' ? (
                                                <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 w-fit ${statusDisplay.color}`}>
                                                    <statusDisplay.icon size={10} />
                                                    {statusDisplay.label}
                                                </span>
                                            ) : (
                                                <span className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap font-bold ${task.status === 'Merged' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    task.status === 'In-Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        task.status === 'Submitted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                            'bg-gray-700/50 text-gray-400 border-gray-600'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            )}
                                        </td>

                                        {/* Priority */}
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold ${task.priority === 'High' ? 'text-red-400' :
                                                task.priority === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12 text-gray-500 text-sm">
                        No active tasks found for this project.
                    </div>
                )}
            </div>

            {/* SIDEBAR OVERLAY */}
            {selectedTask && (
                <TaskDetailPanel
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={(updatedTask) => {
                        onTaskUpdate(updatedTask); // Update parent (ProjectDetails)
                        setSelectedTask(updatedTask); // Keep sidebar in sync
                    }}
                />
            )}
        </div>
    );
};

export default AllProjectTasks;