const readline = require('readline')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')
const crypto = require("libp2p-crypto")
const CryptoJS = require("crypto-js")
const events = require('events')
const changeUserInfo = new events.EventEmitter()

const files = require('./lib/files')
const account = require('./lib/account')

const rl = readline.createInterface(process.stdin, process.stdout)
const prefix = "wallet> "
const passpref = "password> "

let walletPath, user_status, userInfo = undefined

// "undefined" if account is not created
// "unlogined" if account exist but user not loged
// "logined" if user loged and can send coins or get your balance


// call checkInput recursively
const validatePass = (walletPath, enterPass) => {
    return checkInput(walletPath, enterPass)
        .then(result => result)
        .catch(err => {
            console.log(`Sorry: ${err}. Please, try again`)
            throw new Error("Bad input")
        })
}

// check truth password
const checkInput = (walletPath, enterPass) => {
    return new Promise((resolve, reject) => {
        enterPass = CryptoJS.SHA256(enterPass).toString()
        files.decryptContent(walletPath, enterPass).then(newContent => {
            resolve(newContent)
        }).catch(err => reject(new Error('Invalid password')))
    })
}
//36a49d57a4541a917370b1052e454e29b388f5445ed941a841531c1d0b714c30


async function start(){

    const config = JSON.parse(fs.readFileSync("config.json", 'utf8'))

    const ws = new WebSocket(`ws://127.0.0.1:${config.wsPort}`)
    // Need to broadcast tx to node

    ws.onerror = (err) => {
        if(err.error.code === "ECONNREFUSED"){
            console.log("Cannot connect - network is down")
        }else {
            console.log("Хз что там происходит, рили хз")
        }
    }

    ws.on('open', () => {
        files.getWalletPath().then(pathOfWallet => {
            walletPath = String(pathOfWallet)
            const walletFile = fs.existsSync(walletPath)
            if(walletFile == true){
                user_status = "unlogined"
                console.log(prefix + "Enter your password")
            } else {
                user_status = "undefined"
                console.log(prefix + "We are going to create wallet. Please, input new password")
            }

            rl.on('line', async line => {
                //TODO: check that command has all params, scopes and others
                let command = line.replace(/^\s+|\s+$/gm, "")// more regex
                if(command === "quit" || command === "exit" || command === "quit()" || command === "exit()"){
                    rl.close()
                }

                switch(user_status) {
                    case "undefined":
                    if(command !== ""){
                        // creating new key pair
                        let newUserInfo = await account.createAccount()
                        //command it is password
                        // create file "wallet.json" with encrypted keys
                        newUserInfo = JSON.stringify(newUserInfo, null, 2)
                        newUserInfo = JSON.parse(newUserInfo)
                        newUserInfo.amount = 2000
                        newUserInfo.passwordHash = CryptoJS.SHA256(command).toString()
                        const createdWallet = await files.createJsonFile(walletPath, newUserInfo, newUserInfo.passwordHash)
                        if(createdWallet === true){
                            user_status = "unlogined"
                            console.log("Successfully created new account")
                        }
                        console.log("Please, enter your password")
                    
                    } else {
                        console.log("Empty password, please, try again...")
                    }
                    break
                        
                    case "unlogined":
                    validatePass(walletPath, command).then(res => {
                        if(res){
                            //console.log(res)
                            userInfo = res
                            rl.setPrompt(prefix, prefix.length)
                            rl.prompt()
                            user_status = "logined"
                            console.log("Successfully logged in")
                        } 
                    }).catch(err => {
                        rl.setPrompt(passpref, passpref.length)
                        rl.prompt()
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
                    
                        //const sender = await account.getUserInfo()

                        const _saddress = String(userInfo.id)
                        const _raddress = String(params[0])
                        const _amount = Number(params[1])
                        const _famount = Number(userInfo.amount)

                        if(_famount < _amount){
                            rl.setPrompt(prefix, prefix.length)
                            rl.prompt()
                            console.log("Not enough money, please try again")
                            break
                        }

                        txOk = {
                            senderAddr: _saddress,
                            recipientAddr: _raddress,
                            amount: _amount
                        }

                        txOk.id = getUniqueId()

                        ws.send(JSON.stringify({
                            action: 'transfer',
                            data: txOk
                        }))


                        //console.log(txOk)

                        changeUserInfo.emit("decreaseBalance", _amount)
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


                        //const info = await files.decryptContent(walletPath, userInfo.passwordHash)
                        console.log("Your balance = " + userInfo.amount/* + " " + info.amount*/)
                        break 

                        default:
                        rl.setPrompt(prefix, prefix.length)
                        rl.prompt()
                        console.log("Unknown command... \n Enter 'help' to get all info about commands")
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
        
        }).catch(err => console.log(new Error("пошло по пизде")))
    })

    ws.on('message', async msgStred => {
                            
        const msg = JSON.parse(msgStred)
        console.log(msgStred)
        if (msg.action != null) {
          console.log('a new cmd:', msg)
          switch (msg.action) {
            case 'increaseBalance':
            if(user_status === "unlogined"){
                txRes = {
                    info: 'User is unlogined'
                }
                ws.send(JSON.stringify({code: 1, data: txRes}))
            }
            // const code = 1
            // txRes = {
            //     info: 'increasing balance fall'
            // }
            // changeUserInfo.emit("increaseBalance", Number(msg.data.amount))
            // const code = 0
            // txRes = {id: msg.data.id, ts: Math.floor((new Date).getTime() / 1000)}
            // ws.send(JSON.stringify({code: code, data: txRes}))
            break

            case 'decreaseBalance':
            account.decreaseBalance(msg.data.amount).then(res => {
                if(res){// res != null   (error)
                    const code = 1
                    txRes = {
                        info: 'decreasing balance fall'
                    }
                }
                //res == null
                const code = 0
                txRes = {id: msg.data.id, ts: Math.floor((new Date).getTime() / 1000)}
                ws.send(JSON.stringify({code: code, data: txRes}))
            })
            break
            default:
              txRes = {
                info: 'something going wrong'
              };
              ws.send(JSON.stringify({code: 1, data: txRes}))
          }
        } else {
          if (msg.code != null) {
            return console.log('a confirmation:', msg);
          } else {
            txRes = {
              info: 'wrong format'
            };
            return ws.send(JSON.stringify({code: 1, data: txRes}))
          }
        }
    })

    ws.on('close', function close() {
        //console.log('Cannot connect - network is down, please, get up client and try again')
        process.exit(0)
    })
}


changeUserInfo.on("increaseBalance", async _amount => {
    userInfo.amount = Number(userInfo.amount) + Number(_amount)
    await files.createJsonFile(walletPath, userInfo, userInfo.passwordHash)
}).on("decreaseBalance", async _amount => {
    userInfo.amount = Number(userInfo.amount) - Number(_amount)
    await files.createJsonFile(walletPath, userInfo, userInfo.passwordHash)
})


// get params from command in stdin
const preproccessing = inputString => {
    if(inputString.split('(')[0] === inputString) return null
    inputString = inputString.replace(/\s/g,"")// delete all spaces
    let str = inputString.split('(')[1]
    str = str.substring(0, str.length - 1)
    let params = [] = str.split(',') 
    return params
}

const getUniqueId = () => crypto.randomBytes(16).toString('hex')

start()
