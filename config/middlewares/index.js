const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
// Object to maintain status codes
const StatusCodes = {
	SUCCESS: 0,
	BAD_REQUEST: 400,
	INTERNAL_ERROR: 500,
};

const severDir = 'src/.preview';

const formatPathname = (filename, dir = '/') => {
	return path.resolve(process.cwd(), dir, filename.startsWith('/') ? filename.slice(1) : filename);
};

// Factory function for creating response objects
const createResponse = (message, code, success) => {
	return { message, code, success };
};

const formatFiles = (files = []) => {
	const li = files?.map(it => ({
		...it,
		filename: formatPathname(
			it.filename.startsWith('/') ? it.filename.slice(1) : it.filename,
			severDir
		),
	}));
	return li;
};

const initCode = `import React from 'react';
const Home: React.FC = props => {
\tconst { ...rest } = props;
\treturn <div>Loading...</div>;
};
export default Home;`;

const middlewaresInit = app => {
	// 启用 CORS，允许所有跨域请求
	app.use(cors());

	// 使用 bodyParser 解析 application/json
	app.use(express.json());

	// 使用 bodyParser 解析 application/x-www-form-urlencoded
	app.use(express.urlencoded({ extended: true }));

	fs.promises.writeFile(formatPathname('index.tsx', severDir), initCode);

	app.get('/ping', (req, res) => {
		res.json({ message: 'pong' });
	});
	app.post('/files', async (req, res) => {
		const files = req.body; // Expecting an array of { filename, code }
		// Check if files is an array
		if (!Array.isArray(files)) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json(createResponse('Request body must be an array.', StatusCodes.BAD_REQUEST, false));
		}
		const responses = []; // To store the response for each file update
		try {
			// Create an array of promises for updating files
			const updatePromises = formatFiles(files).map(async ({ filename, code }) => {
				if (!filename || !code) {
					return createResponse('Filename and code are required.', StatusCodes.BAD_REQUEST, false); // Custom response for missing fields
				}

				// Define the path where the file is located
				const filePath = filename; // Adjust the path as necessary
				console.log(filePath);
				try {
					// Write the new content to the specified file
					await fs.promises.writeFile(filePath, code);
					return createResponse(
						`File ${filename} updated successfully.`,
						StatusCodes.SUCCESS,
						true
					); // Success response
				} catch (error) {
					return createResponse(`${error.message}`, StatusCodes.INTERNAL_ERROR, false);
				}
			});

			// Wait for all file updates to complete
			const results = await Promise.all(updatePromises);
			responses.push(...results); // Combine results

			res.json(responses); // Respond with the array of messages
		} catch (error) {
			console.error('Error updating files:', error);
			res
				.status(StatusCodes.INTERNAL_ERROR)
				.json(createResponse('Internal server error', StatusCodes.INTERNAL_ERROR, false));
		}
	});
};
module.exports = {
	middlewaresInit,
	formatPathname,
};
