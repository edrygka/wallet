const PeerId = require('peer-id')


module.exports = {
    createAccount: () => {
        return new Promise((res, rej) => {
            PeerId.create({ bits: 1024 }, (err, id) => {
                if (err) rej(err)
                res(id)
            })
        })
    }
}

