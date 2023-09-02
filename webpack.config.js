const { merge } = require('webpack-merge');

module.exports = ({ WEBPACK_SERVE, APP_ENV, NODE_ENV }) => {
	console.log('环境变量', WEBPACK_SERVE, APP_ENV, NODE_ENV);
	process.env.NODE_ENV = NODE_ENV;
	process.env.APP_ENV = APP_ENV || 'prod';
	const commonConfig = require('./config/webpack.common.js');
	const envConfig = require(`./config/webpack.${NODE_ENV}.js`); // 引入开发环境或生产环境配置
	return merge(commonConfig, envConfig);
};
