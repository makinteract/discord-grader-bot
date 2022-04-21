import inquirer from 'inquirer';
import InquirerFuzzyPath from 'inquirer-fuzzy-path';
import path from 'path';
import colors from 'colors';
import * as R from 'ramda';

function displayMessage(message: string, color: colors.Color, clear: boolean) {
  if (clear) console.clear();
  console.log(color(`${message}`));
}

const greet = R.curry(displayMessage)(R.__, colors.rainbow, true);
const success = R.curry(displayMessage)(R.__, colors.green, false);
const error = R.curry(displayMessage)(R.__, colors.red, false);
const warning = R.curry(displayMessage)(R.__, colors.yellow, false);

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

interface Selectable {
  name: string;
  value: any;
}

async function checkFromList(
  message: string = 'Check desired items from the list: ',
  choices: Selectable[] = [],
  defaultCheck: boolean = false
) {
  const { selections } = await inquirer.prompt({
    name: 'selections',
    type: 'checkbox',
    message,
    choices,
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
  greet,
  error,
  success,
  warning,
  pickFile,
  pickFromList,
  checkFromList,
  getInput,
};
