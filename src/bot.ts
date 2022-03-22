import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';

class Bot {
  private client: DiscordJS.Client;

  constructor() {
    dotenv.config();

    this.client = new DiscordJS.Client({
      intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS',
        'DIRECT_MESSAGE_TYPING',
      ],
      partials: ['CHANNEL'],
    });
  }

  goOnline() {
    this.client.on('ready', async () => {
      console.log('Bot is online');

      //   const users: Student[] = await getStudents(PARTICIPANTS_FILE_NAME);
      //   const scores: Score[] = getScores(HOMEWORK_SCORE_FILE_NAME);

      //   // Process each student and send a discord message
      //   users.forEach(({ ID, discordID }) => {
      //     const entry = scores.find((value: Score) => value.ID == ID);
      //     const gradeMessage = entry?.summary;
      //     if (gradeMessage) sendMessage(discordID, gradeMessage, DEBUGGING);
      //   });
      //   console.log('DONE');
    });
    this.client.login(process.env.TOKEN);
  }
}

// Get started

// Helper

// async function sendMessage(userId: string, textMessage: string, test: boolean) {
//   if (test) {
//     console.log(userId, textMessage, '\n');
//   } else {
//     // send message via discord
//     const user = await client.users.fetch(userId).catch(() => null);
//     if (!user) return;

//     console.log('Sending to ', userId, textMessage, '\n');
//     await user.send(textMessage).catch(() => {
//       console.error(
//         'User has DMs closed or has no mutual servers with the bot'
//       );
//     });
//   }
// }

export { Bot };

/*
//   let message = `Hello ${name}. For ${homework} you received a score of **${score}/100**. The class average was **${average}/100**.\n`;
//   message += `This are the scores for the individual parts: ${scoreText}`;
//   message += notes ? `Notes:  ${notes}` : 'No notes';
//   return message;
// }

*/
