const readline = require('readline')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')
const crypto = require("libp2p-crypto")

const files = require('./lib/files')
const account = require('./lib/account')
//const config = require('./config')

const rl = readline.createInterface(process.stdin, process.stdout)
const prefix = "wallet> "
const passpref = "password> "

let passwordPath 
let walletPath

const ws = new WebSocket('ws://127.0.0.1:9091')
// Need to broadcast tx to node

let user_status 
// "undefined" if account is not created
// "unlogined" if account exist but user not loged
// "logined" if user loged and can send coins or get your balance


// first start
const first = (callback) => {
    fs.readFile("./config.json", 'utf8', async (err, content) => {
        if(err) return callback(err)

        const newContent = JSON.parse(content)

        passwordPath = newContent.baseDirectory + newContent.walletDirectory + newContent.passwordFileName
        walletPath = newContent.baseDirectory + newContent.walletDirectory + newContent.walletFileName

        return callback(null)
    })
}


const validatePass = (enterPass) => {
    return checkInput(enterPass)
        .then(result => result)
        .catch(err => {
            console.log(`Sorry: ${err}. Please, try again`)
            return err
            //validatePass(enterPass)
        })
}

const checkInput = (enterPass) => {
    return new Promise((resolve, reject) => {
        fs.readFile(passwordPath, 'utf8', (err, passw) => { 
            corePassword = JSON.parse(passw).password
            if (enterPass === corePassword) {
                resolve(true)
            } else {
                reject(new Error('Invalid password'))
            }
        })
    })
}


function start(){

    ws.onerror = (err) => {
        if(err.error.code === "ECONNREFUSED"){
            console.log("Cannot connect - network is down")
        }else {
            console.log("Хз что там происходит, рили хз")
        }
    }

    ws.on('open', () => {
        first((err => {
            if(err) throw err
            const walletDir = files.directoryExists('.wallet')
            const walletFile = fs.existsSync(walletPath)
            const passwFile = fs.existsSync(passwordPath)
            if(walletDir == true && walletFile == true && passwFile == true){
                user_status = "unlogined"
                console.log(prefix + "Enter your password")
            } else {
                user_status = "undefined"
                console.log(prefix + "We are runing to create wallet. Input new password")
            }

            rl.on('line', async line => {
                //TODO: check that command has all params, scopes and others
                let command = line.replace(/^\s+|\s+$/gm, "")// more regex
                if(command === "quit" || command === "exit" || command === "quit()" || command === "exit()"){
                    process.exit(0)
                }

                switch(user_status) {
                    case "undefined":
                    // creating new key pair
                    const userInfo = await account.createAccount()
                    //command it is password
                    if(command !== ""){
                    const result = await prepairing(command, userInfo)
                        if(result === true){
                            user_status = "unlogined"
                            console.log("Successfuly created new account")
                        } // throw reject, get more details
                        console.log("Enter your password")
                    
                    } else {
                        console.log("Empty password, please try again...")
                    }
                    break
                        
                    case "unlogined":
                    validatePass(command).then(res => {
                        if(res === true){
                            rl.setPrompt(prefix, prefix.length)//костыли пиздец...
                            rl.prompt()
                            user_status = "logined"
                            console.log("Successfuly logined")
                        } else {
                            rl.setPrompt(passpref, passpref.length)//костыли пиздец...
                            rl.prompt()
                        }
                    }).catch(err => {
                        console.log(err + " stranno")// тут вооще все странно, catch не вызывается в принципе
                    })
                    break


                    case "logined":

                    const params = preproccessing(command)// get all params from string

                    command = command.split('(')[0]// get only command, without params
                        
                    switch(command) {
                        case 'help':
                        console.log(" Help: \n You can send transaction this command - 'transferCoins(address, amount)'\n Check your balance - 'getBalance'\n Exit from wallet -'quit' or 'exit'")
                        break

                        case 'transferCoins':
                    
                        const sender = await account.getAddress()

                        txOk = {
                            senderAddr: sender,
                            recipientAddr: params[0],
                            amount: params[1]
                        }

                        txOk.id = getUniqueId()

                        ws.send(JSON.stringify({
                            action: 'transfer',
                            data: txOk
                        }))
                        console.log(txOk)

                        ws.on('message', msgStred => {
                            var msg
                            console.log('got message:', msgStred)
                            msg = JSON.parse(msgStred)
                            return ws.send(JSON.stringify({
                                code: 0,
                                data: msg.data.id
                            }))
                        })

                        break

                        case 'getBalance':
                        rl.setPrompt(prefix, prefix.length)
                        rl.prompt()
                        console.log("Coming soon")
                        break 

                        default:
                        rl.setPrompt(prefix, prefix.length)
                        rl.prompt()
                        console.log("Say what? I might have heard '" + line.trim() + "'\n Enter 'help' to get all info about commands")
                        break
                    }
                    break
                }
                if(user_status === "unlogined" || user_status === "undefined"){
                    rl.setPrompt(passpref, passpref.length)
                } else {
                    rl.setPrompt(prefix, prefix.length)
                }
                rl.prompt()
            }).on('close', () => {
                console.log('Wallet procces is ended. Good to see you. Have a great day!')
                process.exit(0)
            })

            if(user_status === "unlogined" || user_status === "undefined"){
                rl.setPrompt(passpref, passpref.length)
            } else {
                rl.setPrompt(prefix, prefix.length)
            }
    
            rl.prompt()
        
        }))
    })

    ws.on('close', function close() {
        console.log('disconnected')
        process.exit(0)
    })
}


const prepairing = (password, keys) => {
    return new Promise((resolve, reject) => {
        files.createDirectory('./.wallet/').then(createdDir => {
            files.createJsonFile(walletPath, keys).then(createdWallet => {
                files.createJsonFile(passwordPath, {password: password}).then(createdPassword => {
                    resolve(true)
                }).catch(err => reject(err))
            }).catch(err => reject(err))
        })
    }) 
}

const preproccessing = inputString => {
    if(inputString.split('(')[0] === inputString) return null
    inputString = inputString.replace(/\s/g,"")
    const str = inputString.split('(')[1]
    let params = [] = str.split(',') 
    return params
}

const getUniqueId = () => crypto.randomBytes(16).toString('hex')

start()
