const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const buildPath = path.resolve(__dirname, 'build');
const modulesPath = path.resolve(__dirname, 'node_modules');
const childProcess = require('child_process');
// const commitCount = parseInt(childProcess.execSync('git rev-list HEAD --count').toString(), 10);
const commitCount = 0;
const production = process.env.NODE_ENV === 'production';

const bundle = function(app) {
	const appPath = path.resolve(__dirname, app.source);
	return {
	 name: app.name,
	 entry: (app.modules || []).concat([
		 path.join(appPath, 'index.sass'),
		 appPath
	 ]),
	 resolve: {
		 root: appPath,
		 extensions: ['', '.js', '.sass']
	 },
	 output: {
		 path: buildPath,
		 filename: (app.path || '') + (production ? '[hash].js' : 'bundle.js'),
		 publicPath: '/'
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
					 presets: ['es2015', 'stage-1'],
					 compact: false
				 }
			 },
			 {
				 test: /\.(frag|vert)$/,
				 loader: 'raw',
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
			 }
		 ]
	 },
	 node: {
		 fs: 'empty'
	 },
	 postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
	 plugins: [
		 new webpack.DefinePlugin({
			 'process.env': {
				 NODE_ENV: JSON.stringify(production ? "production" : "development")
			 },
			 VERSION: JSON.stringify('v0.' + Math.floor(commitCount / 10) + '.' + (commitCount % 10))
		 }),
		 new ExtractTextPlugin((app.path || '') + (production ? '[hash].css' : 'bundle.css'), {
			 allChunks: true
		 }),
		 new HtmlWebpackPlugin({
			 title: app.name,
			 filename: (app.path || '') + 'index.html',
			 //favicon: !app.path ? path.join(appPath, 'favicon.png') : false,
			 minify: {
				 collapseWhitespace: true
			 }
		 }),
		 new webpack.NoErrorsPlugin()
	 ].concat(production ? [
			 new webpack.optimize.DedupePlugin(),
			 new webpack.optimize.OccurrenceOrderPlugin(),
			 new webpack.optimize.UglifyJsPlugin({
				 compressor: {
					 warnings: false
				 }
			 }),
			 new ImageminPlugin()
		 ] : [])
 };
};

module.exports = [
	bundle({name: 'Procedural', source: 'app', modules: ['perfnow', 'fpsmeter']})
];
