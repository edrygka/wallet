const fs = require('fs')
//const readline  = require('./lib/readline')
const account = require('./lib/account')
const files = require('./lib/files')
const config = require('./config')
const readline = require('readline')

const rl = readline.createInterface(process.stdin, process.stdout)

const password_path = config.walletDirectoryName + config.passwordFileName
const wallet_path = config.walletDirectoryName + config.walletFileName

const validatePass = () => {
  return checkInput()
    .then(pass => console.log(`Your password is valid: ${pass}`))
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
}

const askBool = () => {
  return new Promise((resolve, reject) => {
    rl.question('Yes or No: ', answer => {
      if(answer.length){
        rl.close()
        resolve(answer)
      }
      reject(new Error('Invalid aanswer'))
    })
  })
}

const askPassword = () => {
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

function debug_output(message,loglevel)
{
    if (loglevel <= config[cmd_filename].debugLevel)
    {
        console.log(message)
    }
}


async function main() {
  if (files.directoryExists('.wallet') == true && files.fileExist(wallet_path) == true && files.fileExist(password_path) == true) {
    
    validatePass()

    //entering wallet 
  } else {
    const newAccount = await askBool()

    if(newAccount == "Yes"){
      const passphrase = await askBool()

      console.log("ну хоть сюда ", passphrase)
      files.createDirectory("/.wallet/").then(async directCreated => {
        console.log(directCreated)
        if(directCreated == true){
          const userInfo = await account.createAccount()
          

          files.createJsonFile(wallet_path, JSON.stringify(userInfo.toJSON(), null, 2)).then(created => {
            console.log(created)
            if(created == true){
              console.log("Successfuly created wallet!")
            }
          })


          files.createJsonFile(password_path, JSON.stringify(passphrase)).then(pwFile => {
            console.log(pwFile)
            if(pwFile == true){
              console.log("Successfuly created password file!")
            }
          })
        }
      })
    }
  }
} 



main()


