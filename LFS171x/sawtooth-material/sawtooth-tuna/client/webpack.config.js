// SPDX-License-Identifier: Apache-2.0

const path = require('path')

module.exports = {
  entry: './src/app',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
