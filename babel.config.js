const { NODE_ENV: env } = process.env;

const presets = [
  [
    "@babel/preset-env",
    {
      targets: "> 0.25%, last 2 versions, not ie < 11",
      modules: env === "test" ? "commonjs" : false
    }
  ],
  "@babel/preset-typescript"
];

module.exports = {
  presets
};
