import Discord from 'discord.js-light';
import CommandManager from './CommandManager.js';

export default class Bot extends Discord.Client {
  constructor(options) {
    return new Promise(async (res) => {
      super(options);
      this._prefix = options.prefix;
      this.owner = options.owner;

      if (options.commands) this.commands = await new CommandManager(this, options.commands);

      this.hooks = {};
      
      this.once('ready', this._onReady);
      this.on('messageCreate', this._onMessageCreate);

      res(this);
    });
  }

  async prefix(...args) {
    return this._prefix instanceof String ? this._prefix : await this._prefix(...args);
  }


  async _onReady() {
    console.log('ready!');
  }

  async _onMessageCreate(message) {
    if (!await this.checkHooks(message)) return;

    const prefix = await this.prefix(message);
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = this.commands.resolve(args.shift());
    if (!command) return;

    return command.run(message, args);
  }


  hook(event, func) {
    this.hooks[event] ??= [];
    this.hooks[event].push(func);
  }

  unhook(event, func) {
    if (!this.hooks[event]) return;
    const index = this.hooks[event].indexOf(func);
    if (index >= 0) this.hooks[event].splice(index, 1);
  }

  async checkHooks(event, ...args) {
    const done = [];
    for (const hook of this.hooks[event]) {
      done.push(await hook(...args));
    }
    return done.every(res=>res!==false);
  }
}