const PeerId = require('peer-id')



module.exports = {
    createAccount: () => {
        PeerId.create({ bits: 1024 }, (err, id) => {
            if (err) { throw err }
            return id
        })
    }
}

