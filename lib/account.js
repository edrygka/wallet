const PeerId = require('peer-id')
const fs = require('fs')
const files = require('./files')
let walletPath


// get content of wallet.json file(id, private, public kyes, amount and password hash)
const getUserInfo = () => {
    return new Promise((res, rej) => {
        files.getWalletPath().then(walletPath => {
            fs.readFile(walletPath, 'utf8', (err, newContent) => {
                if(err) rej(err)
                res(JSON.parse(newContent))
            })
        })
    })
}

module.exports = {
    //create account(id, private and public keys)
    createAccount: () => {
        return new Promise((res, rej) => {
            PeerId.create({ bits: 1024 }, (err, id) => {
                if (err) rej(err)
                res(id)
            })
        })
    },

    getUserInfo: getUserInfo,

    // increase main user balance
    increaseBalance: (increaseAmount) => {
        return new Promise((res, rej) => {
            getUserInfo().then(userInfo => {
                const newBalance = Number(userInfo.amount) + Number(increaseAmount)
                files.inputNewAmount(newBalance).then(result => {
                    res(result)
                })
            }).catch(err => rej(err))
        })
    },

    // decrease main user balance
    decreaseBalance: (decreaseAmount) => {
        return new Promise((res, rej) => {
            getUserInfo().then(userInfo => {
                const newBalance = Number(userInfo.amount) - Number(decreaseAmount)
                files.inputNewAmount(newBalance).then(result => {
                    res(result)
                })
            }).catch(err => rej(err))
        })
    }
}

