#!/usr/bin/env node

import { createSpinner } from 'nanospinner';
import { Bot } from './bot';
import {
  greet,
  success,
  error,
  warning,
  pickFile,
  pickFromList,
  checkFromList,
  getInput,
} from './ui';
import {
  Participant,
  MessageInfo,
  getParticipantsData,
  generateMessage,
  loadDiscordUsers,
} from './grader';

// Constants
const DATA_DIR = 'data';
const DEFAULT_TITLE = 'Homework';
let bot: Bot;

// Entry point
try {
  bot = new Bot();
} catch (e: any) {
  error(`An error occurred: ${e.message}`);
  process.exit();
}

executeFlow();

// Helpers

async function executeFlow() {
  // 0. Hello
  greet('✨ Welcome to the grader Bot ✨');

  // 1. Set title
  const title = await getInput(
    'What is the name of this homework?',
    DEFAULT_TITLE
  );

  // 2. Load the users of Discord
  const usersFile = await pickFile(
    "Select participants' list (csv file):",
    DATA_DIR,
    /.*.(xlsx|XLSX|xls|XLS)$/
  );

  loadDiscordUsers(usersFile);

  // 3. Pick an excel file with the score
  const scoreFile = await pickFile(
    'Select a file with the score (Excel file):',
    DATA_DIR,
    /.*.(xlsx|XLSX|xls|XLS)$/
  );
  const scoreData = getParticipantsData(scoreFile);

  // 4. Do you want to pick specific users

  let filteredUsers = scoreData;
  const ans = await pickFromList('Do you want to select specific users?', [
    'No',
    'Yes',
  ]);
  if (ans == 'Yes') {
    filteredUsers = await checkFromList(
      'Select the users:',
      scoreData.map((e) => ({
        name: e.name,
        value: e,
      }))
    );
  }

  // 6. Get message for the users
  const messages = filteredUsers.map(generateMessage);

  // 7. What do you want to do now?
  while (true) {
    const doit = await pickFromList(
      'Do you want to do now?',
      ['Visualize the scores', 'Send the scores via Discord Bot', 'Exit'],
      'rawlist'
    );

    switch (doit) {
      case 'Exit':
        greet('Bye ✌️');
        process.exit();
        break;
      case 'Visualize the scores':
        visualizeMessages(messages);
        break;
      case 'Send the scores via Discord Bot':
        sendMessages(messages, title);
        break;
    }
  }
}

// Helpers

function visualizeMessages(messagesToSend: MessageInfo[]) {
  if (messagesToSend.length == 0) error('Nothing to display');
  else
    messagesToSend.forEach(({ message: m }, i: number) =>
      i % 2 == 0 ? success(m) : warning(m)
    );
}

function makeTitle(title: string): string {
  return `\`\`\`json\n"${title}"\n\`\`\`\n`;
}

async function sendMessages(messagesToSend: MessageInfo[], titleText: string) {
  if (!bot) throw new Error('Bot cannot be initialized');

  // Connect
  try {
    await bot.login(2000);
    success('Bot connected');
  } catch (err: any) {
    error(err);
    return; // bye
  }

  const title = makeTitle(titleText);
  // Send one by one
  for (let m of messagesToSend) {
    const spinner = createSpinner(
      `Sending message to ${m.receipientName} (${m.receipientDiscordID})`
    ).start();
    try {
      await bot.sendData(m.receipientDiscordID, title + m.message);
      spinner.success();
    } catch (err: any) {
      spinner?.error();
    }
  }
}
