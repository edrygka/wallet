const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const inquirer  = require('./lib/inquirer')

const files = require('./lib/files')

clear()
console.log(
  chalk.yellow(
    figlet.textSync('AXEL wallet', { horizontalLayout: 'full' })
  )
)
files.getCurrentDirectoryBase()


const run = async () => {
  if (files.directoryExists('.wallet')) {
    console.log(chalk.red('Wallet is finded!'))
    const credentials = await inquirer.askCredentials()
    //console.log(credentials)

  } else {
    console.log(chalk.red("Wallet is not exist, do you want create new one?"))
    const result = await inquirer.askBool()
    if(result){
      files.createDirectory()
    }
  }

  
}

run()


