import { Router } from "express";
import { textServiceClient } from "./utils.js";

export const promptRouter = Router();

promptRouter.route("/summary").post(async (req, res) => {
	const { text, numOfPoints, level } = req.body;

	try {
		const result = await textServiceClient.generateText({
			model: "models/text-bison-001",
			prompt: {
				text: `
                Summarize the following text in ${numOfPoints} ${level} points in given format,

                {
                    "summary": [points]
                }

                ${text}
                `,
			},
			temperature: 0.7,
			candidateCount: 1,
			topK: 40,
			topP: 0.95,
			maxOutputTokens: 3000,
			stopSequences: [],
			safetySettings: [
				{
					category: "HARM_CATEGORY_DEROGATORY",
					threshold: 1,
				},
				{
					category: "HARM_CATEGORY_DANGEROUS",
					threshold: 2,
				},
				{
					category: "HARM_CATEGORY_MEDICAL",
					threshold: 2,
				},
				{
					category: "HARM_CATEGORY_SEXUAL",
					threshold: 2,
				},
				{
					category: "HARM_CATEGORY_VIOLENCE",
					threshold: 2,
				},
				{
					category: "HARM_CATEGORY_TOXICITY",
					threshold: 1,
				},
			],
		});

		let summary = [];

		if (result[0].candidates[0].output) {
			summary = JSON.parse(result[0].candidates[0].output);
		}

		return res.status(200).json({
			success: true,
			data: {
				summary: summary.summary
			},
		});
	} catch (error) {
        console.log(error);

		if (error instanceof Error) {
			console.log(error.message);

			return res.status(400).json({
				success: false,
				error: error.message,
			});
		}

		console.log(error);

		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
});
