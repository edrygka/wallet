const PeerId = require('peer-id')
const fs = require('fs')
const config = require('../config')

module.exports = {
    createAccount: () => {
        return new Promise((res, rej) => {
            PeerId.create({ bits: 1024 }, (err, id) => {
                if (err) rej(err)
                res(id)
            })
        })
    },

    getAddress: () => {
        return new Promise((res, rej) => {
            fs.readFile(config.walletPath, 'utf8', (err, content) => {
                if(err) rej(err)
                res(JSON.parse(content).pubKey)
            })
        })
    }
}

