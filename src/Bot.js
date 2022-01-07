import Discord from 'discord.js';
import CommandManager from './CommandManager.js';
import EmbedFactory from './EmbedFactory.js';

export default class Bot extends Discord.Client {
  constructor(options={}) {
    return new Promise(async (res) => {
      super(options);
      this._prefix = options.prefix;
      this.owners = options.owners ?? [options.owner];
      
      this.embeds = new EmbedFactory(options.embeds);
      if (options.commands) this.commands = await new CommandManager(this, options.commands);

      res(this);
    });
  }

  async login(token) {
    if (!this.listenerCount('messageCreate')) this.on('messageCreate', this._onMessageCreate);
    if (!this.listenerCount('ready')) this.once('ready', this._onReady);
    return super.login(token);
  }

  async prefix(...args) {
    return typeof this._prefix == 'string' ? this._prefix : await this._prefix(...args);
  }


  async _onReady() {
    console.log('ready!');
  }

  async _onMessageCreate(message) {
    const prefix = await this.prefix(message);
    if (message.author.bot || !message.content.startsWith(prefix)) {
      if (RegExp(`<@!?${this.user.id}>`).test(message.content) && message.mentions.users.has(this.user.id)) message.channel.send({ embeds: [{ description: `My prefix is \`${prefix}\`` }]});
      return;
    };
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = this.commands.resolve(args.shift());
    if (!command) return;

    try {
      const res = await command.run(message, args);
      if (res.toMsg) return message.channel.send(res.toMsg());
    } catch (err) {
      console.log(err);
    }
  }
}