const Project = require('../models/Project');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { encrypt } = require('../utils/encryption');

// create a new project workspace
exports.createProject = async (req, res, next) => {
    try {
        const { title, description, aiApiKey } = req.body;

        // create project data with owner
        const projectData = {
            title,
            description,
            owner: req.user.id,
            members: [{ user: req.user.id, role: 'Owner' }]
        }

        // encrypt api key
        if (aiApiKey) {
            const encryptedKey = encrypt(aiApiKey);
            projectData.aiApiKey = encryptedKey;
        }

        // create project
        const project = await Project.create(projectData);

        //log initial activity
        await Activity.create({
            project: project._id,
            user: req.user.id,
            action: `Created Workspace: "${title}"`
        });

        res.status(201).json(new ApiResponse(
            project,
            'Project created successfully',
            201
        ));
    } catch (error) {
        next(error);
    }
};

// get all projects for logged-in user
exports.getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user.id },
                { 'member.user': req.user.id }
            ],
            isArchived: false
        })
            .populate('owner', 'name email, avatar');

        res.status(200).json(new ApiResponse(projects, 'User projects retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// get project by id
exports.getProjectById = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('member.user', 'name email avatar')
            .populate('tasks');

        if (!project) {
            return next(new ApiError('Project not found', 404));
        }

        res.status(200).json(new ApiResponse(project, 'Project details retrieved successsfully'));

    } catch (error) {
        next(error);
    }
};

// invite a member in project
exports.inviiteMember = async (req, res, next) => {
    try {
        const { email, role } = req.body;

        // find user using email
        const userToInvite = await User.findOne({ email });

        // check if user exist
        if (!userToInvite) {
            return next(new ApiError('User not found with this email', 404));
        }

        // check if user is already a user
        const project = await Project.findById(req.params.id);
        const alreadyMember = project.members.some(
            (m) => m.user.toString() === userToInvite._id.toString()
        );

        if (alreadyMember) {
            return next(new ApiError('User is already member of the project', 400));
        }

        // add member and log activity
        project.members.push({ user: userToInvite._id, role: role || 'Contributor' });
        await project.save();

        await Activity.create({
            project: project._id,
            user: req.user.id,
            action: `Invited ${userToInvite.name} as ${role || 'Contributor'}`
        });

        res.status(200).json(new ApiResponse(project, `Successfully invited ${userToInvite.name}`));
    } catch (error) {
        next(error);
    }
};