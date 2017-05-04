if (process.env.SUPERSTRING_USE_BROWSER_VERSION) {
  module.exports = require('./browser');
} else {
  try {
    module.exports = require('./build/Release/superstring.node')
  } catch (e) {
    module.exports = require('./build/Debug/superstring.node')
  }

  const {TextBuffer} = module.exports
  const {load, reload, save, search} = TextBuffer.prototype

  for (const methodName of ['load', 'reload']) {
    const nativeMethod = TextBuffer.prototype[methodName]
    TextBuffer.prototype[methodName] = function (filePath, encoding, progressCallback) {
      if (typeof encoding !== 'string') {
        progressCallback = encoding
        encoding = 'UTF8'
      }

      return new Promise((resolve, reject) =>
        nativeMethod.call(this, filePath, encoding, (error, result) => {
          error ?
            reject(error) :
            resolve(result)
        }, progressCallback)
      )
    }
  }

  TextBuffer.prototype.save = function (filePath, encoding = 'UTF8') {
    return new Promise((resolve, reject) =>
      save.call(this, filePath, encoding, (result) => {
        result ?
          resolve() :
          reject(new Error(`Invalid encoding name: ${encoding}`))
      })
    )
  }

  TextBuffer.prototype.search = function (pattern) {
    return new Promise((resolve, reject) => {
      search.call(this, pattern, (error, result) => {
        error ?
          reject(error) :
          resolve(result)
      })
    })
  }
}
