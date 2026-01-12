const Project = require('../models/Project');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { decrypt } = require('../utils/encryption');
const { ApiError } = require('../utils/apiResponse');

class AIService {

    async #getProjectApiKey(projectId) {
        const project = await Project.findByid(projectId).select("+aiApiKey");

        if (!project || !project.aiApiKey || !project.aiApiKey.content) {
            throw new ApiError("AI API Key not found for this project", 404);
        }

        return decrypt(project.aiApiKey);
    }

    async reviewSubmission(projectId, taskDetails, submissionContent) {
        try {
            const apiKey = await this.#getProjectApiKey(projectId);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-pro"
            })

            const prompt = `
                As an expert project manager, review the following task submission:
                Task Title: ${taskDetails},
                Task Description: ${taskDetails.description},
                Submitted Work/Notes: ${submissionContent}

                Provide a JSON reponse with:
                1. "feedback": A detailed crtique of the work.
                2. "scrore": A quality score from 1-100.
                3. "passedAI": Boolean (true if score > 70).
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error("AI review error");
            throw new ApiError("Failed to generate AI review", 500);
        }
    };

    async generateProjectSummary(projectId, activities) {
        try {

            const apiKey = await this.#getProjectApiKey(projectId);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const activityLog = activities.map(a => a.action).join("\n");
            const prompt =
                `Summarize the current progress of this project based on these recent activities:
            ${activityLog}

            Provide a concise 2-3 sentence status update for the dashboard.
            `

            const result = await model.generateContent(prompt);
            const response = await result.response;

            await Project.findByIdAndUpdate(projectId, {
                aiSummary: response.text()
            });

            return response.text();
        } catch (error) {
            console.error("AI Summary error");
            return "Unable to update AI summary at this time.";
        }
    }
}

module.exports = new AIService();

