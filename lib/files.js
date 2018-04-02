const fs = require('fs')
const path = require('path')
const Keychain = require('libp2p-keychain')
const FsStore = require('datastore-fs')
const crypto = require('crypto')


module.exports = {
  getCurrentDirectoryBase : () => path.basename(process.cwd()),

  // createKeyChain : options => {
  //   const wallet = new FsStore('./.wallet')
  //   const keychain = new Keychain(wallet, options)
  // },
  createDirectory : () => {
    if (!fs.existsSync("./.wallet")){
      fs.mkdirSync("./.wallet", err => {
        if(err) throw err
        console.log("kek ты даун")
        return true
      })
    }
  },

  directoryExists : filePath => {
    try {
      return fs.statSync(filePath).isDirectory()
    } catch (err) {
      return false
    }
  }, 

  createJsonFile: (path, name, dict, opts) => {
    // opts.password
    // create encrypted json file
    fs.writeFile(path, name, dict, err => {
      if(err) throw err
    })
  }
}