const readline = require('readline')
const fs = require('fs')
const path = require('path')

const files = require('./lib/files')
const account = require('./lib/account')
const config = require('./config')

const rl = readline.createInterface(process.stdin, process.stdout)
const prefix = "wallet> "

const password_path = config.walletDirectoryName + config.passwordFileName
const wallet_path = config.walletDirectoryName + config.walletFileName



let user_status 
// 0 if .wallet is not defined 
// 1 if user have an account(public, private keys)



const validatePass = () => {
    return checkInput()
        .then(result => console.log(`Your password is valid: ${result}`))
        .catch(err => {
            console.log(`Sorry: ${err}. Please, try again`)
            validatePass()
        })
}

const checkInput = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(password_path, 'utf8', async (err, passw) => {
            corePassword = JSON.parse(passw).password
            rl.question('Enter your password: ', pass => {
                if (pass === corePassword) {
                    rl.close()
                    process.stdin.destroy()
                    resolve(true)
                } else {
                    reject(new Error('Invalid password'))
                }
            })
        })
    })
}
  
function start(){

    rl.on('line', line => {
        let command = line.toLowerCase().replace(/^\s+|\s+$/gm, "")
        console.log(command)
        switch(command) {
            case 'help':
            console.log('world!')
            break
        default:
            console.log('Say what? I might have heard `' + line.trim() + '`')
            break
        }
        rl.setPrompt(prefix, prefix.length)
        rl.prompt()
    }).on('close', () => {
        console.log('Wallet procces is ended. Good to see you. Have a great day!')
        process.exit(0)
    })
    console.log(prefix + 'Let s get started')
    rl.setPrompt(prefix, prefix.length)
    rl.prompt()
    
}


async function main_interface(){
    const walletDir = files.directoryExists('.wallet')
    const walletFile = fs.existsSync(wallet_path)
    const passwFile = fs.existsSync(password_path)
    if(walletDir == true && walletFile == true && passwFile == true){

        await validatePass()

    } else {

        rl.question(prefix + "Let's create wallet. Input new password: ", async newPassword => {
            rl.close()

            const userInfo = await account.createAccount()

            prepairing(newPassword, userInfo)// throw reject, get more details
        })
    }

    start()

}

function prepairing(password, keys){
    files.createDirectory('./.wallet/').then(createdDir => {
        console.log(createdDir)
        files.createJsonFile(wallet_path, keys).then(createdWallet => {
            console.log(createdWallet)
        }).catch(err => console.log(err))
        files.createJsonFile(password_path, {password: password}).then(createdWallet => {
            console.log(createdWallet)
        }).catch(err => console.log(err))
    })
}



main_interface()
