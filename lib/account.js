const PeerId = require('peer-id')
const fs = require('fs')
const files = require('./files')
let walletPath

module.exports = {
    createAccount: () => {
        return new Promise((res, rej) => {
            PeerId.create({ bits: 1024 }, (err, id) => {
                if (err) rej(err)
                res(id)
            })
        })
    },

    getUserInfo: () => {
        return new Promise((res, rej) => {
            files.getWalletPath().then(walletPath => {
                fs.readFile(walletPath, 'utf8', (err, newContent) => {
                    if(err) rej(err)
                    res(JSON.parse(newContent))
                })
            })
        })
    }
}

