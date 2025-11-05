const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        'admin/js/dist/admin': path.resolve(__dirname, 'admin/js/src/index.js'),
        'public/js/dist/designer': path.resolve(__dirname, 'public/js/src/Designer.js'),
        'public/js/dist/products-listing': path.resolve(__dirname, 'public/js/src/MyAccount.js')
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
        splitChunks: {
            cacheGroups: {
                adminVendor: {
                    test: /[\\/]node_modules[\\/](fabric|lodash)[\\/]/,
                    name: 'admin/js/dist/vendor',
                    chunks: (chunk) => chunk.name.startsWith('admin/'),
                    enforce: true
                },
                publicVendor: {
                    test: /[\\/]node_modules[\\/](fabric|lodash)[\\/]/,
                    name: 'public/js/dist/vendor',
                    chunks: (chunk) => chunk.name.startsWith('public/'),
                    enforce: true
                },
                adminCommon: {
                    name: 'admin/js/dist/common',
                    chunks: (chunk) => chunk.name.startsWith('admin/'),
                    minChunks: 2,
                    enforce: true
                },
                publicCommon: {
                    name: 'public/js/dist/common',
                    chunks: (chunk) => chunk.name.startsWith('public/'),
                    minChunks: 2,
                    enforce: true
                }
            }
        }
    },
    resolve: {
        extensions: ['.js', '.scss'],
        alias: {
            '@admin': path.resolve(__dirname, 'admin/js/src'),
            '@public': path.resolve(__dirname, 'public/js/src'),
            '@shared': path.resolve(__dirname, 'shared/js')
        }
    },
    devtool: 'source-map',
    mode: 'development'
};