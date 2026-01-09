const Project = require('../models/Project');
const { ApiError } = require('../utils/apiResponse');

/**
 * Middleware to check if the logged-in user is the owner of the project.
 * This is used for "Final Gates" like merging work or deleting a project.
 */
exports.isProjectOwner = async (req, res, next) => {
    try {
        // Get Project ID from request (params or body depending on route)
        // For submissions: /api/submissions/:id/merge, we need to find the project through the submission
        // For tasks/projects: /api/projects/:id
        const projectId = req.params.projectId || req.params.id || req.body.projectId;

        if (!projectId) {
            return next(new ApiError('Project ID is required for this action', 400));
        }

        // Find the project
        const project = await Project.findById(projectId);

        if (!project) {
            return next(new ApiError('Project not found', 404));
        }

        // Check if the user is the specific owner of the project
        // Note: project.owner is an ObjectId, req.user.id is a string/ObjectId
        const isOwner = project.owner.toString() === req.user.id.toString();

        if (!isOwner) {
            return next(new ApiError('Access denied. Only the project owner can perform this action.', 403));
        }

        // Grant access
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * General middleware to check for specific roles within a project members array
 * Usage: authorizeProjectRole('Owner', 'Contributor')
 */
exports.authorizeProjectRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const projectId = req.params.projectId || req.params.id;
            const project = await Project.findById(projectId);

            if (!project) {
                return next(new ApiError('Project not found', 404));
            }

            // Find the user's role in this project's member list
            const memberRecord = project.members.find(
                (m) => m.user.toString() === req.user.id.toString()
            );

            if (!memberRecord || !allowedRoles.includes(memberRecord.role)) {
                return next(new ApiError('You do not have the required permissions in this workspace.', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};