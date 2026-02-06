import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

// Components
import ProjectHeader from '../components/project/ProjectHeader';
import OverallProgress from '../components/project/OverallProgress';
import WorkloadStatus from '../components/project/WorkloadStatus';
import ActivityLog from '../components/project/ActivityLog';
import AIPulseCard from '../components/project/AIPulseCard';
import TeamMembersCard from '../components/project/TeamMembersCard';

// Modals
import CreateTaskModal from '../components/project/CreateTaskModal';
import ManageTeamModal from '../components/project/ManageTeamModal';
import DeleteConfirmationModal from '../components/project/DeleteConfirmationModal';

const ProjectDetails = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    // --- STATE ---
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals State
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showManageTeam, setShowManageTeam] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // New Task Form State
    const [newTask, setNewTask] = useState({
        title: '', description: '', assignedTo: '', priority: 'Medium', deadline: ''
    });

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const projectRes = await api.get(`/projects/${id}`);
                setProject(projectRes.data.data);
                setTasks(projectRes.data.data.tasks || []);

                try {
                    const activityRes = await api.get(`/activities/project/${id}`);
                    setActivities(activityRes.data.data || []);
                } catch (actErr) {
                    console.warn("Could not fetch activities", actErr);
                    setActivities([]);
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Failed to load project data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- HANDLERS ---
    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newTask, projectId: id };
            if (payload.assignedTo === '') payload.assignedTo = null;

            const { data } = await api.post('/task', payload);

            setTasks([data.data, ...tasks]);
            setShowCreateTask(false);
            setNewTask({ title: '', description: '', assignedTo: '', priority: 'Medium', deadline: '' });
            alert("Task created successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create task");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm("Are you sure? This user will be removed from the project immediately.")) return;
        try {
            await api.delete(`/projects/${id}/members/${memberId}`);
            setProject(prev => ({
                ...prev,
                members: prev.members.filter(m => m.user._id !== memberId)
            }));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to remove member");
        }
    };

    const confirmDeleteProject = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/projects/${id}`);
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete project');
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // --- CALCULATIONS & RENDER ---
    if (loading) return <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white animate-pulse">Loading Workspace...</div>;
    if (error || !project) return <div className="flex items-center justify-center h-screen bg-[#0f172a] text-red-400">Error: {error || "Project not found"}</div>;

    const isOwner = currentUser?._id === project.owner._id;
    const activeMembers = project.members.filter(m => m.status === 'Active');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Merged').length;
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'To-Do').length,
        inprogress: tasks.filter(t => t.status === 'In-Progress').length,
        submitted: tasks.filter(t => t.status === 'Submitted').length,
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0f172a] overflow-hidden font-sans">

            <ProjectHeader
                projectTitle={project.title}
                onNewTaskClick={() => setShowCreateTask(true)}
            />

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">

                    {/* LEFT COLUMN */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <OverallProgress
                                progressPercentage={progressPercentage}
                                completedTasks={completedTasks}
                                totalTasks={totalTasks}
                            />
                            <WorkloadStatus
                                tasksByStatus={tasksByStatus}
                                totalTasks={totalTasks}
                            />
                        </div>
                        <ActivityLog activities={activities} />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        <AIPulseCard aiSummary={project.aiSummary} />
                        <TeamMembersCard
                            activeMembers={activeMembers}
                            onManageTeamClick={() => setShowManageTeam(true)}
                        />
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <CreateTaskModal
                isOpen={showCreateTask}
                onClose={() => setShowCreateTask(false)}
                onSubmit={handleCreateTask}
                newTask={newTask}
                setNewTask={setNewTask}
                activeMembers={activeMembers}
            />

            <ManageTeamModal
                isOpen={showManageTeam}
                onClose={() => setShowManageTeam(false)}
                members={project.members}
                currentUser={currentUser}
                isOwner={isOwner}
                onRemoveMember={handleRemoveMember}
                onDeleteProjectClick={() => setShowDeleteModal(true)}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteProject}
                isDeleting={isDeleting}
                projectTitle={project.title}
            />
        </div>
    );
};

export default ProjectDetails;