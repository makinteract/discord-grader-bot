import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';
import { getStudents, getScores, Score, Student } from './grader';

// CHANGE HERE
const PARTICIPANTS_FILE_NAME = 'participants.csv'; // Contains ID and DiscordID
const HOMEWORK_SCORE_FILE_NAME = 'template.xlsx'; // Contains the score info

/// START
dotenv.config();

const client = new DiscordJS.Client({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING',
  ],
  partials: ['CHANNEL'],
});

// Get started
client.on('ready', async () => {
  console.log('Bot is online');

  const users: Student[] = await getStudents(PARTICIPANTS_FILE_NAME);
  const scores: Score[] = getScores(HOMEWORK_SCORE_FILE_NAME);

  // Process each student and send a discord message
  users.forEach(({ ID, discordID }) => {
    const entry = scores.find((value: Score) => value.ID == ID);
    const gradeMessage = entry?.summary;
    if (gradeMessage) sendMessage(discordID, gradeMessage);
  });
});

client.login(process.env.TOKEN);

// Helper

async function sendMessage(userId: string, textMessage: string) {
  const user = await client.users.fetch(userId).catch(() => null);
  if (!user) return;
  await user.send(textMessage).catch(() => {
    console.log('User has DMs closed or has no mutual servers with the bot');
  });
}
