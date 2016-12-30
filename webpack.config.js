'use strict';

const production = process.env.NODE_ENV === 'production';
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const path = require('path');
const appPath = path.resolve(__dirname, 'app');
const modulesPath = path.resolve(__dirname, 'node_modules');
const outputPath = path.resolve(__dirname, 'dist');
const publicPath = process.env.BASENAME || '/';
const commitCount = (function() {
	if(!fs.existsSync('.git')) return 0;
	const childProcess = require('child_process');
	try {
		return parseInt(childProcess.execSync('git rev-list HEAD --count').toString(), 10);
	} catch(e) {
		return 0;
	}
})();
const trackCount = (function() {
	if(!fs.existsSync(path.join(appPath, 'Music'))) return 0;
	try {
		return fs.readdirSync(path.join(appPath, 'Music')).filter(function(file) {return file.substr(file.length - 4) === '.ogg'}).length;
	} catch(e) {
		return 0;
	}
})();
module.exports = {
	entry: (!production ? [
		'webpack-hot-middleware/client?reload=true'
	] : []).concat([
		'perfnow',
		'fpsmeter',
		path.join(appPath, 'index.sass'),
		appPath
	]),
	resolve: {
		root: appPath,
		extensions: ['', '.js', '.sass']
	},
	output: {
		path: outputPath,
		filename: production ? '[hash].js' : 'app.js',
		publicPath: publicPath
	},
	devtool: production ? 'cheap-module-source-map' : 'eval',
	sassLoader: {
		outputStyle: 'compressed'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: appPath,
				exclude: modulesPath,
				query: {
					presets: ['es2015', 'stage-1']
				}
			},
			{
				test: /\.(frag|vert|glsl)$/,
				loader: 'webpack-glsl',
				include: appPath,
				exclude: modulesPath
			},
			{
				test: /\.sass$/,
				loader: ExtractTextPlugin.extract(
					'style',
					'css!postcss!sass'
				),
				include: appPath,
				exclude: modulesPath
			},
			{
				test: /\.(jpg|png)$/,
				loader: 'file',
				include: appPath,
				exclude: modulesPath,
				query: {
					name: 'textures/' + (production ? '[hash].[ext]' : '[name].[ext]')
				}
			},
			{
				test: /\.ogg$/,
				loader: 'file',
				include: appPath,
				exclude: modulesPath,
				query: {
					name: 'music/' + (production ? '[hash].[ext]' : '[name].[ext]')
				}
			},
			{
				test: /\.worker\.js$/,
				loader: 'file',
				include: path.join(modulesPath, 'gif.js', 'dist'),
				query: {
					name: 'workers/' + (production ? '[hash].[ext]' : '[name].[ext]')
				}
			}
		],
		noParse: path.join(modulesPath, 'gif.js', 'dist')
	},
	postcss: [autoprefixer({browsers: ['last 2 versions']})],
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(production ? "production" : "development")
			},
			BASENAME: JSON.stringify(publicPath.substr(0, publicPath.length - 1)),
			VERSION: JSON.stringify('v0.' + Math.floor(commitCount / 10) + '.' + (commitCount % 10)),
			MUSIC_TRACKS: trackCount
		}),
		new ExtractTextPlugin(production ? '[hash].css' : 'app.css', {
			allChunks: true
		}),
		new HtmlWebpackPlugin({
			title: 'Procedural terrain',
			minify: {
				collapseWhitespace: true
			}
		}),
		new webpack.optimize.OccurrenceOrderPlugin()
	].concat(!production ? [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	] : [
		new webpack.optimize.UglifyJsPlugin({
			compressor: {
				warnings: false,
				screw_ie8: true
			}
		}),
		new ImageminPlugin()
	])
};
