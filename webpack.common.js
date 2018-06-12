const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {HashedModuleIdsPlugin} = require('webpack');
const ENV = process.env.NODE_ENV || 'development';

module.exports = {
    entry: {
        main: path.resolve(__dirname, "src/assets/js/main.js")
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/",
        filename: 'assets/js/[name].[chunkhash].js',
        chunkFilename: 'assets/js/[name].[chunkhash].js'
    },
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules\/(.*)\.js/,
                    name: 'vendor',
                    chunks: "all"
                }
            }
        }
    },

    resolve: {
        extensions: ['.jsx', '.js', '.json', '.less'],
        modules: [
            path.resolve(__dirname, "src/lib"),
            path.resolve(__dirname, "node_modules"),
            'node_modules'
        ]
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: path.resolve(__dirname, 'src'),
                enforce: 'pre',
                use: 'source-map-loader'
            },
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: 'babel-loader',
                    // options: {
                    //     presets: ["react"]
                    // }
                },
                exclude: /node_modules/
                // include: '/src/assets/js/'
            },
            {
                test: /(\.css|\.scss|\.sass)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')({
                                    'browsers': [
                                        '> 1%',
                                        'last 2 versions'
                                    ]
                                })
                            ]
                        }

                    }
                ]
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.(xml|html|txt|md)$/,
                use: 'raw-loader'
            },
            {
                test: /\.(gif|jpg|png|ico)\??.*$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: '[name].[ext]',
                        publicPath: '../../',
                        outputPath: 'assets/css/'
                    }
                }
            },
            {
                test: /\.(svg|woff|otf|ttf|eot)\??.*$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: '[name].[ext]',
                        publicPath: '../../',
                        outputPath: 'assets/css/'
                    }
                }
            },
            // {
            //     test: /\.html$/,
            //     use: {
            //         loader: 'html-loader',
            //         options: {
            //             minimize: false,
            //             removeComments: false,
            //             collapseWhitespace: false
            //         }
            //     }
            // }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV)
        }),
        new HashedModuleIdsPlugin(),
        new CleanWebpackPlugin(["dist"], {
            root: '',
            verbose: true,
            dry: false
        }),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, "src/assets/img"),
            to: path.resolve(__dirname, "dist/assets/img")

        }, {
            from: path.resolve(__dirname, "src/assets/media"),
            to: path.resolve(__dirname, "dist/assets/media")
        }]),
        new MiniCssExtractPlugin({
            filename: 'assets/css/[name].[chunkhash].min.css',
            chunkFilename: 'assets/css/[name].[chunkhash].css'
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            hash: true
            // minify: {
            //     removeComments: false,
            //     collapseWhitespace: false
            // }
            // favicon: path.resolve(__dirname, 'src/assets/favicon.ico'),

        })

    ]
};