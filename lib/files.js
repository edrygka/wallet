const fs = require('fs')
const path = require('path')
const Keychain = require('libp2p-keychain')
const FsStore = require('datastore-fs')
const CryptoJS = require("crypto-js")
const nodecipher = require('node-cipher')
const crypto = require('crypto')


// get path to wallet.json
// if we have config.json file - get wallet path from this file ("baseDirectory" property)
// if not - default wallet path is "./config.json"
const getWalletPath = () => {
  return new Promise((res, rej) => {
    fs.exists(path.join("./config.json"), exists => {
      if(exists == true){
        fs.readFile("./config.json", 'utf8', (err, content) => {
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
}

const encryptContent = (content, password) => {
  return new Promise((res, rej) => {
    try {
      const mykey = crypto.createCipher('aes-256-cbc', password);
      let enc = mykey.update(content, 'utf8', 'hex')
      enc = enc + mykey.final('hex')
      res(enc)
    } catch (e) {
      rej(e)
    }
  })
}


module.exports = {
  // get directory where this process is running
  getCurrentDirectoryBase : () => process.cwd(),

  // if directory with the same path exist, returns "true"
  directoryExists : filePath => {
    try {
      return fs.statSync(filePath).isDirectory()
    } catch (err) {
      return false
    }
  }, 

  // create directory in current folder with "name"
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

  getWalletPath : getWalletPath,

  // write new amount in wallet.json
  inputNewAmount : (value) => {
    return new Promise((res, rej) => {
      getWalletPath().then(walletPath => {
        fs.readFile(walletPath, (err, data) => {
          if(err) rej(err)
          const oldContent = JSON.parse(data)
          oldContent.amount = value
          fs.writeFile(walletPath, JSON.stringify(oldContent, null, 2), result => res(result))
        })
      })
    })
  },

  // create json file with name = "file", content = "content" and password hash
  createJsonFile: (file, content, password) => {
    return new Promise(async (res, rej) => {
      content = JSON.stringify(content, null, 2)
      const encContent = await encryptContent(content, password)
      fs.writeFile(file, JSON.stringify({data: encContent}), err => {
        if(err) rej(err)
        res(true)
      })
    })
  },

  // encrypt "data" through password and write in file with path = "filePath"
  encryptFile: (inputFile, outputFile, password) => {
    return new Promise((res, rej) => {
      nodecipher.encrypt({
        input: inputFile,
        output: outputFile,
        password: password,
        algorithm: "aes-128-cbc"
      }, (err, opts) => {
        if (err) rej(err)
        res(null)
      })
    })
  },

  // decrypt file("filePath") through password
  decryptFile: (inputFile, outputFile, password) => {
    return new Promise((res, rej) => {
      nodecipher.decrypt({
        input: inputFile,
        output: outputFile,
        password: password,
        algorithm: "aes-128-cbc"
      }, (err, opts) => {
        if (err) rej(err)
        res(null)
      })
    })
  },

  encryptContent: encryptContent,

  decryptContent: (filePath, password) => {
    return new Promise((res, rej) => {
      fs.readFile(filePath, 'utf8', (err, content) => {
        if(err) rej(err)
        content = JSON.parse(content).data
        try {
          const mykey = crypto.createDecipher('aes-256-cbc', password);
          let mystr = mykey.update(content, 'hex', 'utf8')
          mystr += mykey.final('utf8');
          res(JSON.parse(mystr.toString()))
        } catch (e) {
          rej(e)
        }
      })
    })
  }
}