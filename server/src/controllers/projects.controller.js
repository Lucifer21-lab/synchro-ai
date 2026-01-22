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
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'Owner' }]
        };

        // encrypt api key
        if (aiApiKey) {
            const encryptedKey = encrypt(aiApiKey);
            projectData.aiApiKey = encryptedKey;
        }

        // create project
        const project = await Project.create(projectData);

        // log initial activity
        await Activity.create({
            project: project._id,
            user: req.user._id,
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
                { owner: req.user._id },
                { 'members.user': req.user._id } // Fixed: 'members' (plural) not 'member'
            ],
            isArchived: false
        })
            .populate('owner', 'name email avatar'); // Fixed: Removed comma

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
            .populate('members.user', 'name email avatar') // Fixed: 'members' (plural)
            .populate('tasks');

        if (!project) {
            return next(new ApiError('Project not found', 404));
        }

        res.status(200).json(new ApiResponse(project, 'Project details retrieved successfully'));

    } catch (error) {
        next(error);
    }
};

// invite a member in project
exports.inviteMember = async (req, res, next) => {
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

        if (!project) {
            return next(new ApiError('Project not found', 404));
        }

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
            user: req.user._id,
            action: `Invited ${userToInvite.name} as ${role || 'Contributor'}`
        });

        res.status(200).json(new ApiResponse(project, `Successfully invited ${userToInvite.name}`));
    } catch (error) {
        next(error);
    }
};