const path = require("path");
const resolve = dir => path.join(__dirname, dir);
const { ENV = "" } = process.env;

module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: process.env.NODE_ENV === "production" ? "./src/external/We3D.ts" : "./src/index.ts"
    }
  },
  // 根据环境变量部署应用包时的基本 URL,生产环境需要替换成打包的路径
  publicPath: "/",
  // 静态资源目录 (js, css, img, fonts)
  assetsDir: "public", // 相对于outputDir的静态资源(js、css、img、fonts)目录
  filenameHashing: false,
  // 是否为生产环境构建生成 source map
  productionSourceMap: false,

  configureWebpack: config => {
    if (["pro"].includes(ENV)) {
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ["console.log"];
    }
  },

  devServer: {
    port: 9000
  },

  chainWebpack: config => {
    config.module
      .rule("glsl")
      .test(/\.glsl$/)
      .use("raw")
      .loader("raw-loader")
      .end();
  }
};
