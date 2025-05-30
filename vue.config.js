const { defineConfig } = require('@vue/cli-service')
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  outputDir: path.resolve(__dirname, "dist"),
  publicPath: "./", // 关键：让 Vue 资源使用相对路径
  configureWebpack: {
    devtool: 'source-map'
  }
};