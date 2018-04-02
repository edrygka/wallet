const inquirer   = require('inquirer')
const files      = require('./files')

module.exports = {
  askBool: () => {
    const YesOrNo = [
      {
        name: 'answer',
        type: 'list',
        message: 'Are you sure to create new account?',
        choices: ["Yes",new inquirer.Separator(), "No"],
        validate: value => {
          if (value.length) return true
          if(value == "No") return undefined
        }
      }
    ]
    return inquirer.prompt(YesOrNo)
  },
  askGithubCredential: () => {
    const questions = 
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password.';
          }
        }
      }
    return inquirer.prompt(questions);
  }
}