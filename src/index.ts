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

// Constants
const DATA_DIR = 'data';
const DEFAULT_TITLE = 'Homework';

// Entry point
executeFlow();

async function executeFlow() {
  // 0. Hello
  displayMessage('✨ Welcome to the grader Bot ✨', true);

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

  // 6. Get message for the users
  const scores = getScores(scoreFile);
  const summary = summarizeData(scores, users);
  const messagesToSend = makeMessages(summary, title);

  // 7. What do you want to do now?
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
        visualizeMessages(messagesToSend);
        break;
      case 'Send the scores via Discord Bot':
        sendMessages(messagesToSend);
        break;
    }
  }
}

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
  name: string;
};

function summarizeData(scores: Score[], users: DiscordUser[]): Summary[] {
  return (
    scores
      .map((score: Score): Summary | undefined => {
        const user = users.find(({ id }: DiscordUser) => id === score.id);

        if (!user) {
          // No discord ID found
          return undefined;
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
      // filter out the undefined values
      // need to cast to Summary[]!
      .filter((s: Summary | undefined) => s != undefined) as Summary[]
  );
}

function makeMessages(data: Summary[], title: string): Message[] {
  const prettyTitle = `\`\`\`json\n"${title}"\n\`\`\`\n`;

  return data.map(
    ({ id, name, discordID, score, average, description }: Summary) => {
      return {
        discordID,
        name,
        message:
          `${prettyTitle}Hi ${name} (${id}), your homework score is **${score} / 100** (Average: **${average} / 100**).` +
          `\n\nThe individual parts are graded this way: ${description}`,
      };
    }
  );
}

function visualizeMessages(messagesToSend: Message[]) {
  if (messagesToSend.length == 0) displayError('Nothing to display');
  else
    messagesToSend.forEach((m: Message, i: number) =>
      i % 2 == 0 ? displaySuccess(m.message) : displayWarning(m.message)
    );
}

async function sendMessages(messagesToSend: Message[]) {
  const bot = new Bot();

  // Connect
  try {
    await bot.login(2000);
    displaySuccess('Bot connected');
  } catch (err: any) {
    displayError(err);
    return; // bye
  }

  // Send one by one
  for (let m of messagesToSend) {
    const spinner = createSpinner(
      `Sending message to ${m.name} (${m.discordID})`
    ).start();
    try {
      await bot.sendData(m.discordID, m.message);
      spinner.success();
    } catch (err: any) {
      spinner?.error();
    }
  }
}
