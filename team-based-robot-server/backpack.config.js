/* eslint-disable  */
const HappyPack = require('happypack')
const happyThreadPool = HappyPack.ThreadPool({ size: 10 })

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = './server/index.js'
    config.devtool = 'source-map'

    let babelOptions
    config.module.rules = config.module.rules.map(rule => {
      if (rule.loader === 'babel-loader') {
        babelOptions = rule.options
        return {
          test: rule.test,
          exclude: rule.exclude,
          use: {
            loader: require.resolve('happypack/loader'),
            query: {id: 'babel'},
          },
        }
      }
      return rule
    })

    config.plugins = [
      ...config.plugins,
      new HappyPack({
        id: 'babel',
        threadPool: happyThreadPool,
        loaders: [
          {
            path: require.resolve('babel-loader'),
            query: babelOptions,
          },
        ],
        verbose: false,
      }),
    ]
    return config
  },
}
