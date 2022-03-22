import inquirer from 'inquirer';
import InquirerFuzzyPath from 'inquirer-fuzzy-path';
import path from 'path';
import colors from 'colors';

function displayMessage(message: string, clear: boolean = false) {
  if (clear) console.clear();
  console.log(colors.rainbow(`${message}`));
}
function displayError(message: string, clear: boolean = false) {
  if (clear) console.clear();
  console.log(colors.red(`${message}`));
}
function displaySuccess(message: string, clear: boolean = false) {
  if (clear) console.clear();
  console.log(colors.green(`${message}`));
}
function displayWarning(message: string, clear: boolean = false) {
  if (clear) console.clear();
  console.log(colors.yellow(`${message}`));
}

async function pickFile(
  message: string = 'Choose a file:',
  rootPath: string = '.',
  regex: RegExp = /^.*$/
) {
  inquirer.registerPrompt('fuzzypath', InquirerFuzzyPath);

  const { pathToFile } = await inquirer.prompt([
    {
      type: 'fuzzypath',
      name: 'pathToFile',
      excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
      excludeFilter: (nodePath: string) => !regex.test(nodePath),
      itemType: 'file',
      rootPath,
      message,
      suggestOnly: false,
      depthLimit: 5,
    },
  ]);
  return path.resolve(pathToFile);
}

async function pickFromList(
  message: string = 'Choose from the list: ',
  choices: string[] = [],
  type: 'rawlist' | 'list' = 'list'
) {
  const { answer } = await inquirer.prompt({
    name: 'answer',
    type,
    message,
    choices,
  });
  return answer;
}

async function checkFromList(
  message: string = 'Check desired items from the list: ',
  choices: string[] = [],
  defaultCheck: boolean = false
) {
  const { selections } = await inquirer.prompt({
    name: 'selections',
    type: 'checkbox',
    message,
    choices: choices.map((e, i) => ({
      name: e,
      value: { name: e, index: i },
      checked: defaultCheck,
    })),
  });

  return selections;
}

async function getInput(message: string, defaultAnswer: string = '') {
  const { answer } = await inquirer.prompt({
    name: 'answer',
    type: 'input',
    message,
    default() {
      return defaultAnswer;
    },
  });

  return answer;
}

export {
  displayMessage,
  displayError,
  displaySuccess,
  displayWarning,
  pickFile,
  pickFromList,
  checkFromList,
  getInput,
};
