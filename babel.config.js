module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}], // 以我当前node版本为基础做转换
    '@babel/preset-typescript',
  ],
};