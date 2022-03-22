import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';

class Bot {
  private client!: DiscordJS.Client;

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

  async login(timeout: number = 1000): Promise<string> {
    return new Promise((res, rej) => {
      // login
      this.client
        .login(process.env.TOKEN)
        .catch((_) => rej('Unable to connect to the Bot'));

      // ready?
      this.client.on('ready', async () => {
        res('Bot is ready');
      });
      setTimeout(() => {
        rej('Unable to connect to the Bot');
      }, timeout);
    });
  }

  async sendData(discordID: string, message: string) {
    // this.client.on('ready', async () => {
    // send message via discord
    const user = await this.client.users.fetch(discordID).catch(() => null);
    if (!user) throw new Error('No valid discord user');
    await user.send(message).catch(() => {
      console.error(
        'User has DMs closed or has no mutual servers with the bot'
      );
      throw new Error('testing error');
    });
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
