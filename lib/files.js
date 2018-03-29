const fs = require('fs')
const path = require('path')
const Keychain = require('libp2p-keychain')
const FsStore = require('datastore-fs')

module.exports = {
  getCurrentDirectoryBase : () => path.basename(process.cwd()),

  createDirectory : () => {
    if (!fs.existsSync("./.wallet")){
      fs.mkdirSync("./.wallet")
    }
  },

  directoryExists : filePath => {
    try {
      return fs.statSync(filePath).isDirectory()
    } catch (err) {
      return false
    }
  }
};