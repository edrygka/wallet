const inquirer   = require('inquirer')
const files      = require('./files')

module.exports = {

  askCredentials: () => {
    const questions = [
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
    ]
    return inquirer.prompt(questions)
  },
  askBool: () => {
    const YesOrNo = [
      {
        name: 'answer',
        type: 'list',
        message: 'Are you sure to create new account?',
        choices: ["Yes", "No"],
        validate: value => {
          if (value == "Yes") return true
          if(value == "No") return false
        }
      }
    ]
    return inquirer.prompt(YesOrNo)
  }
}