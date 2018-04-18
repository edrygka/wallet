const readline = require('readline')
const fs = require('fs')
const path = require('path')

const files = require('./lib/files')
const account = require('./lib/account')
const config = require('./config')

const rl = readline.createInterface(process.stdin, process.stdout)
const prefix = "wallet> "
const passpref = "password> "

const password_path = config.walletDirectoryName + config.passwordFileName
const wallet_path = config.walletDirectoryName + config.walletFileName



let user_status 
// "undefined" if account is not created
// "unlogined" if account exist but user not loged
// "logined" if user loged and can send coins or get your balance


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
        fs.readFile(password_path, 'utf8', async (err, passw) => {
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
    const walletDir = files.directoryExists('.wallet')
    const walletFile = fs.existsSync(wallet_path)
    const passwFile = fs.existsSync(password_path)
    if(walletDir == true && walletFile == true && passwFile == true){
        user_status = "unlogined"
        console.log(prefix + "Enter your password")
    } else {
        user_status = "undefined"
        console.log(prefix + "We are runing to create wallet. Input new password")
    }

    rl.on('line', async line => {
        let command = line.replace(/^\s+|\s+$/gm, "")// more regex
        //console.log(command)
        switch(user_status) {
            case "undefined":
            console.log("undefined case")
            // creating new key pair
            const userInfo = await account.createAccount()
            //command it is password
            const result = await prepairing(command, userInfo)
            if(result === true){
                user_status = "unlogined"
                console.log(/*prefix + */"Successfuly created new account")
            } // throw reject, get more details
            console.log(/*prefix + */"Enter your password")
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
            // TODO:  all functionality of user
            switch(command) {
                case 'help':
                console.log(" Help: \n You can send transaction this command - 'transferCoins(address, amount)'\n Check your balance - 'getBalance'")
                break

                case 'transferCoins':
                console.log(command)

                break

                case 'getBalance':
                rl.setPrompt(prefix, prefix.length)
                rl.prompt()
                console.log("Balance of your account: ")
                break 

                default:
                rl.setPrompt(prefix, prefix.length)
                rl.prompt()
                console.log("Say what? I might have heard `' + line.trim() + '`\n Enter 'help' to get all info about commands")
                break
            }
            break
        }
        rl.setPrompt(prefix, prefix.length)
        rl.prompt()
    }).on('close', () => {
        console.log('Wallet procces is ended. Good to see you. Have a great day!')
        process.exit(0)
    })
    //console.log("ura")
    //console.log(prefix)
    if(user_status === "unlogined"){
        rl.setPrompt(passpref, passpref.length)
    } else {
        rl.setPrompt(prefix, prefix.length)
    }
    
    rl.prompt()
    
}


function prepairing(password, keys){
    return new Promise((resolve, reject) => {
        files.createDirectory('./.wallet/').then(createdDir => {
            files.createJsonFile(wallet_path, keys).then(createdWallet => {
                files.createJsonFile(password_path, {password: password}).then(createdPassword => {
                    resolve(true)
                }).catch(err => reject(err))
            }).catch(err => reject(err))
        })
    })  
}



start()
