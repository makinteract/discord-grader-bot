#!/usr/bin/env node

import { Bot } from './bot';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {
  displayMessage,
  pickFile,
  pickFromList,
  checkFromList,
  getInput,
} from './ui';
import { DiscordUser, getDiscordUsers, Score, getScores } from './grader';
import { random } from 'lodash';

const DATA_DIR = 'data';

// const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function main() {
  // 1. Hello
  displayMessage('✨ Welcome to the grader Bot ✨');

  /*
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
  */

  // 5. Pick an excel file with the score
  const scoreFile = await pickFile(
    'Select a file with the score (Excel file):',
    DATA_DIR,
    /.*.(xlsx|XLSX|xls|XLS)$/
  );

  const scores = getScores(scoreFile);

  // 6. What do you want to do now?
  // 4. Do you want to pick specific users
  const doit = await pickFromList(
    'Do you want to do now?',
    ['Print the scores for test', 'Send the scores', 'Exit'],
    'rawlist'
  );
  switch (doit) {
    case 'Exit':
      displayMessage('Bye ✌️');
      break;
    case 'Print the scores for test':
      break;

    default:
      break;
  }
}

main();

// const bot = new Bot();

/*
import { getStudents, getScores, Score, Student } from './grader';

// CHANGE HERE
const PARTICIPANTS_FILE_NAME = 'participants.csv'; // Contains ID and DiscordID
const HOMEWORK_SCORE_FILE_NAME = 'hw1.xlsx'; // Contains the score info
const DEBUGGING = false;


*/
