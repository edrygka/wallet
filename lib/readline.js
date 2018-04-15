const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const config = require('../config')


const password_path = config.walletDirectoryName + config.passwordFileName


module.exports = {
    checkInput: () => {
        return new Promise((resolve, reject) => {
            fs.readFile(password_path, 'utf8', async (err, passw) => {
                corePassword = JSON.parse(passw).password
                rl.question('Enter your password: ', pass => {
                    console.log(corePassword, pass)
                    if (pass === corePassword) {
                        rl.close()
                        resolve(true)
                    } else {
                        reject(new Error('Invalid password'))
                    }
                })
            })
        })
    },

    askBool: () => {
        return new Promise((resolve, reject) => {
            rl.question('Yes or No: ', answer => {
                if(answer.length){
                    rl.close()
                    resolve(answer)
                }
                reject(new Error('Invalid aanswer'))
            })
        })
    },

    askCredentials: () => {
        return new Promise((res, rej) => {
            rl.question("Enter your password: ", password => {
                rl.close()
                res(password)
            })
        })
    },
      
    askPassword: () => {
        return new Promise((resolve, reject) => {
            rl.question('Enter your password: ', password => {
                console.log(password)
                // TODO: validation by regex
                rl.close()   
                resolve(password)
                reject(new Error('Something going wrong'))
            })
        })
    }
}