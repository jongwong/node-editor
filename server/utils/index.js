const path = require('path');
const formatPathname = filename => {
	return path.resolve(
		process.cwd(),
		'server/demo',
		filename.startsWith('/') ? filename.slice(1) : filename
	);
};
module.exports = {
	formatPathname,
};
