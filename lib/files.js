const fs = require('fs')
const path = require('path')
const Keychain = require('libp2p-keychain')
const FsStore = require('datastore-fs')
const crypto = require('crypto')
const CryptoJS = require("crypto-js")


module.exports = {
  getCurrentDirectoryBase : () => process.cwd(),

  directoryExists : filePath => {
    try {
      return fs.statSync(filePath).isDirectory()
    } catch (err) {
      return false
    }
  }, 

  createDirectory : name => {
    return new Promise((res, rej) => {
      if (!fs.existsSync(name)){
        fs.mkdirSync(name, err => {
          if(err) rej(err)
        })
      }
      res(true)
    })
  },

  getWalletPath : () => {
    return new Promise((res, rej) => {
      fs.exists(path.join("./config.json"), exists => {
        if(exists == true){
          fs.readFile("./config.json", 'utf8', async (err, content) => {
            if(err) rej(err)  
            const newContent = JSON.parse(content)
            walletPath = `${newContent.baseDirectory}/${newContent.walletFileName}`
            res(walletPath)
          })
        } else {
          res(`wallet.json`)
        }
      })
    })
  },

  createJsonFile: (file, content, password) => {
    return new Promise((res, rej) => {
      content = JSON.stringify(content, null, 2)
      content = JSON.parse(content)
      content.amount = 2000
      content.password = CryptoJS.SHA256(password).toString()
      content = JSON.stringify(content, null, 2)
      fs.exists(path.join(file), exists => {
        if(exists == true){
          res(true)
        } else {
          fs.writeFile(file, content, err => {
            if(err) rej(err)
          })
          res(true)
        }
      })
    })
  },

  encryptFile: (filePath, data, password) => {
    return new Promise((res, rej) => {
      try {
        var cipher = Crypto.createCipher('aes-256-cbc', password)
        var encrypted = Buffer.concat([cipher.update(new Buffer(JSON.stringify(data), "utf8")), cipher.final()])
      } catch (exception) {
        rej({ message: exception.message })
      }
      FileSystem.writeFile(filePath, encrypted, error => {
        if(error) {
            rej(error)
        }
        res({ message: "Encrypted!" })
      })
    })
  },

  decryptFile: (filePath, password) => {
    return new Promise((res, rej) => {
      FileSystem.readFile(filePath, (error, data) => {
        if(error) {
          rej(error)
        }
        try {
          var decipher = Crypto.createDecipher("aes-256-cbc", password)
          var decrypted = Buffer.concat([decipher.update(data), decipher.final()])
          res(JSON.parse(decrypted.toString()))
        } catch (exception) {
          rej({ message: exception.message })
        }
      })
    })
  }
}