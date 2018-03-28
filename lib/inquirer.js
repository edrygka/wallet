const inquirer   = require('inquirer')
const files      = require('./files')

module.exports = {

  askCredentials: () => {
    const questions = [
      {
        name: 'username',
        type: 'input',
        message: 'Enter your username:',
        validate: value => {
          if (value.length) {
            return true
          } else {
            return 'Please enter your username'
          }
        }
      },
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: value => {
          if (value.length) {
            return true
          } else {
            return 'Please enter your password.'
          }
        }
      }
    ];
    return inquirer.prompt(questions)
  },
}