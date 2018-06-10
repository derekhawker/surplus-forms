"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");
var webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
function default_1(env) {
    var plugins = [];
    if (env.prod)
        plugins.push(new webpack_bundle_analyzer_1.BundleAnalyzerPlugin());
    return {
        entry: {
            "index": "./src/index.tsx",
        },
        devServer: {
            contentBase: [path.join(__dirname, "..", "docs")],
        },
        devtool: "source-map",
        output: {
            path: path.resolve(__dirname, "..", "docs"),
            filename: "[name].js",
            publicPath: "/",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
        module: {
            rules: [
                { test: /\.jsx$/, loader: "surplus-loader" },
                { test: /\.ts$/, loader: "ts-loader" },
                { test: /\.tsx$/, loader: "surplus-loader!ts-loader" },
            ],
        },
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    sourceMap: true,
                    uglifyOptions: {
                        compress: {
                            inline: 1,
                        },
                    },
                }),
            ],
        },
        plugins: plugins,
    };
}
exports.default = default_1;
;
//# sourceMappingURL=webpack.config.js.map