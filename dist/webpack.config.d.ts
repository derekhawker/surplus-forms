import * as webpack from "webpack";
declare type NodeEnv = {
    dev: boolean;
    prod: boolean;
    test: boolean;
};
export default function (env: NodeEnv): webpack.Configuration;
export {};
