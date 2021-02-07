const path    = require("path");
const webpack = require("webpack");

const plugins = {
  htmlWebpack: require("html-webpack-plugin"),
};

module.exports = {
  entry: "./frontend/js/main.js",
  output: {
    filename: "script.js",
    path: path.join(__dirname, "public", "static")
  },
  plugins: [
      new plugins.htmlWebpack({
        scriptLoading: "blocking",
        template: path.resolve(__dirname, "frontend" , "index.html"),
        filename: "index.html",
        inject: "head",
      }),
      new webpack.DefinePlugin({
        RAPIDWOLF_RAPIDAPI_KEY: JSON.stringify(process.env.RAPIDWOLF_RAPIDAPI_KEY),
      }),
  ],
  module: {
    rules: [
      {
        test: /\.scss/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              url: true,
              importLoaders: 2
            }
          },
          "sass-loader",
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, "public", "static")
  },
  devtool: "cheap-module-source-map",
};