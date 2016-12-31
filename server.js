'use strict';

const compression = require('compression');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const path = require('path');
const production = process.env.NODE_ENV === 'production';
const publicPath = process.env.BASENAME || '/';

/* Express setup */
const app = express();
if(production) {
	app.use(compression());
	app.use(helmet());
	app.set('trust proxy', 'loopback');
}

/* App server */
const indexPath = path.join(__dirname, 'dist', 'index.html');
if(production) {
	let indexCache = fs.readFileSync(indexPath, 'utf8');
	fs.watchFile(indexPath, () => (indexCache = fs.readFileSync(indexPath, 'utf8')));
	const index = (req, res) => (
		res.set('Cache-Control', 'no-cache').send(indexCache)
	);
	app.get(publicPath, index);
	app.use(publicPath, express.static(path.join(__dirname, 'dist'), {maxAge: 31536000000}));
	app.get(publicPath + '*', index);
} else {
	console.log("Building dev bundle, this will take a minute...");
	const webpack = require('webpack');
	const webpackMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	const webpackConfig = require('./webpack.config.js');
	const compiler = webpack(webpackConfig);
	const middleware = webpackMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		stats: {
			colors: true,
			hash: false,
			timings: true,
			chunks: false,
			chunkModules: false,
			modules: false
		}
	});
	app.use(middleware);
	app.use(webpackHotMiddleware(compiler));
	app.get(publicPath + '*', (req, res) => (
		res.send(middleware.fileSystem.readFileSync(indexPath, 'utf8'))
	));
}

/* Bind the server */
app.listen(process.env.PORT || 8080, process.env.HOSTNAME);
