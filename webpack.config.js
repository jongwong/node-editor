const { resolve } = require("path");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const  path = require('path');
module.exports = function(env) {
  let config = {
    entry: {
      index: "./src/index.ts",
    },
    output: {
      path: resolve("./dist"),
      filename: "[name].bundle.js"
    },
    mode: env.NODE_ENV,
    watch: env.NODE_ENV == "development",
    devtool: env.NODE_ENV == "development" ? "inline-source-map" : undefined,
    resolve: {
      extensions: [".ts", ".js"],
      alias: {
        "@": resolve(__dirname, "src")
      }
    },
    module: {
      rules: [{ test: /\.tsx?$/, use: [{
          loader: 'ts-loader',
          options: {
            configFile: resolve(__dirname,'./tsconfig.json')
          }
        }] }]
    },
    plugins: [
      new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve('./src/index.html'),
          filename: 'index.html' })
    ],
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 9000,
      hot:true
    }
  };
  return config;
};
