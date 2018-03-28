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

// console.log(files.getCurrentDirectoryBase())
// if (files.directoryExists('.git')) {
//     console.log(chalk.red('Already a git repository!'))
//     process.exit()
// }

const run = async () => {
  const credentials = await inquirer.askCredentials();
  console.log(credentials);
}

run();


