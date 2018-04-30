const PeerId = require('peer-id')
const fs = require('fs')
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
            fs.readFile("./config.json", "utf8", async (err, Content) => {
                Content = JSON.parse(Content)
                walletPath = `${Content.baseDirectory}/${Content.walletFileName}`
                fs.readFile(walletPath, 'utf8', (err, newContent) => {
                    if(err) rej(err)
                    res(JSON.parse(newContent))
                })
            })
        })
    }
}

