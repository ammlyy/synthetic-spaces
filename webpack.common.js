const path = require("path");
const Dotenv = require('dotenv-webpack')

var SRC = path.resolve(__dirname, "./assets/samples");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DotenvWebpackPlugin = require("dotenv-webpack");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "./src/index.ts"),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ["glslify-import-loader", "raw-loader", "glslify-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(mp3|wav)$/i,
        options: {
          name: "[path][name].[ext]",
        },
        loader: "file-loader",
      },

      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use:['file-loader']
      },

    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: { "os": require.resolve("os-browserify/browser") }
  },
  output: {
    filename: "bundle.[fullhash].js", // avoid double name
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CleanWebpackPlugin(), // clean the dist folder at each build
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/templates/index.html"),
    }),
    new Dotenv({
      path: '.env'    })
  ],
};
