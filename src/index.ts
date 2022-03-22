#!/usr/bin/env node

import { Bot } from './bot';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import {
  displayMessage,
  displayError,
  displaySuccess,
  displayWarning,
  pickFile,
  pickFromList,
  checkFromList,
  getInput,
} from './ui';
import { DiscordUser, getDiscordUsers, Score, getScores } from './grader';

const DATA_DIR = 'data';
const DEFAULT_TITLE = 'Homework';

let messages: { discordID: string; message: string }[] = [];

async function executeFlow() {
  // 0. Hello
  displayMessage('✨ Welcome to the grader Bot ✨');

  // 1. Set title
  const title = await getInput(
    'What is the name of this homework?',
    DEFAULT_TITLE
  );

  // 2. Pick a CSV file with the discordID and user names/ids
  const usersFile = await pickFile(
    "Select participants' list (csv file):",
    DATA_DIR,
    /.*.(csv|CSV)$/
  );

  // 3. Get the users from the file
  let users: DiscordUser[] = await getDiscordUsers(usersFile);

  // 4. Do you want to pick specific users
  const ans = await pickFromList('Do you want to select specific users?', [
    'No',
    'Yes',
  ]);
  if (ans == 'Yes') {
    const filteredUsers = await checkFromList(
      'Select the users:',
      users.map((e) => e.toString())
    );

    users = filteredUsers.map(
      ({ _, index }: { _: any; index: number }) => users[index]
    );
  }

  // 5. Pick an excel file with the score
  const scoreFile = await pickFile(
    'Select a file with the score (Excel file):',
    DATA_DIR,
    /.*.(xlsx|XLSX|xls|XLS)$/
  );

  const scores = getScores(scoreFile);
  const summary = summarizeData(scores, users);
  const messagesToSend = getMessage(summary, title);

  // 6. What do you want to do now?
  while (true) {
    const doit = await pickFromList(
      'Do you want to do now?',
      ['Visualize the scores', 'Send the scores via Discord Bot', 'Exit'],
      'rawlist'
    );

    switch (doit) {
      case 'Exit':
        displayMessage('Bye ✌️');
        process.exit();
        break;

      case 'Visualize the scores':
        if (messagesToSend.length == 0) displayError('Nothing to display');
        else
          messagesToSend.forEach((m: Message, i: number) =>
            i % 2 == 0 ? displaySuccess(m.message) : displayWarning(m.message)
          );
        break;

      case 'Send the scores via Discord Bot':
        const bot = new Bot();

        const spinner = createSpinner('Sending...').start();
        try {
          const msg = await bot.login(2000);
          displaySuccess(msg);
          for (let m of messagesToSend) {
            displaySuccess(`Sending message to ${m.discordID}`);
            bot.sendData(m.discordID, m.message);
          }
          spinner.success();
        } catch (err: any) {
          displayError(err);
          spinner.error();
        }
        break;

      default:
        break;
    }
  }
}

// Entry point
executeFlow();

// Helpers
type Summary = {
  id: string;
  discordID: string;
  name: string;
  score: string;
  average: string;
  description: string;
};

type Message = {
  discordID: string;
  message: string;
};

function summarizeData(scores: Score[], users: DiscordUser[]): Summary[] {
  return scores
    .map((score: Score): Summary | null => {
      const user = users.find(({ id }: DiscordUser) => id === score.id);

      if (!user) {
        // No discord ID found
        return null;
      }
      const avgScore =
        scores.reduce((sum: number, { score }: Score) => sum + score, 0) /
        scores.length;

      return {
        score: score.scoreFormatted,
        average: avgScore.toFixed(1),
        id: score.id,
        discordID: user.discordID,
        name: user.name,
        description: score.description,
      };
    })
    .filter((s: Summary | null) => s != null) as Summary[]; // need to cast!
}

function getMessage(data: Summary[], title: string): Message[] {
  const prettyTitle = `\`\`\`json\n"${title}"\n\`\`\`\n`;

  return data.map(
    ({ id, name, discordID, score, average, description }: Summary) => {
      return {
        discordID,
        message:
          `${prettyTitle}Hi ${name} (${id}), your homework score is **${score} / 100** (Average: **${average} / 100**).` +
          `\n\nThe individual parts are graded this way: ${description}`,
      };
    }
  );
}
