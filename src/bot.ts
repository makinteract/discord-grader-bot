import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';

class Bot {
  private client!: DiscordJS.Client;

  constructor() {
    dotenv.config();
    if (!process.env.TOKEN) throw new Error('.env file not found');

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
      this.client.login(process.env.TOKEN).catch((err) => {
        console.log(err);

        rej('Unable to connect to the Bot ' + err);
      });

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
    // send message via discord
    const user = await this.client.users.fetch(discordID).catch(() => null);
    if (!user) throw new Error('No valid discord user');
    await user.send(message).catch(() => {
      console.error(
        'User has DMs closed or has no mutual servers with the bot'
      );
    });
  }
}

export { Bot };
