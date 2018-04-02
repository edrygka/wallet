const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const questions  = require('./lib/questions')

const files = require('./lib/files')

clear()
console.log(
  chalk.yellow(
    figlet.textSync('My first wallet', { horizontalLayout: 'full' })
  )
)
files.getCurrentDirectoryBase()


function error_output(message,loglevel)
{
    console.log("{ status: \"error\", message: \""+message+"\"}");
}


async function main() {
  if (files.directoryExists('.wallet')) {
    console.log(chalk.red('Wallet is finded!'))
    const credentials = await questions.askCredentials()
    //entering wallet 
  } else {
    console.log(chalk.red("Wallet is not exist, do you want create new one?"))
    const result = await questions.askBool()
    console.log(result)

    if(result.answer == "Yes"){

      const passphrase = await questions.askGithubCredential()

      const opts = {
        passPhrase: passphrase.password
      }
      files.createDirectory().then((res) => {
        //TypeError: Cannot read property 'then' of undefined
        console.log(data)
        //need return path of directory where create json file
        // create account 
        //files.createJsonFile(path, "wallet.json", data, opts)
      })
    }
  }
} 


main()


