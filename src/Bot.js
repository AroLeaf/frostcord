import Discord from 'discord.js';
import CommandManager from './CommandManager.js';

export default class Bot extends Discord.Client {
  constructor(options) {
    return new Promise(async (res) => {
      super(options);
      this._prefix = options.prefix;
      this.owner = options.owner;

      if (options.commands) this.commands = await new CommandManager(this, options.commands);
      
      this.once('ready', this._onReady || options.onReady);
      this.on('messageCreate', this._onMessageCreate) || options.onMessageCreate;

      res(this);
    });
  }

  async prefix(...args) {
    return typeof this._prefix == 'string' ? this._prefix : await this._prefix(...args);
  }


  async _onReady() {
    console.log('ready!');
  }

  async _onMessageCreate(message) {
    const prefix = await this.prefix(message);
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = this.commands.resolve(args.shift());
    if (!command) return;

    return command.run(message, args).catch(console.log);
  }
}