import Discord from 'discord.js';
import CommandManager from './CommandManager.js';
import MessageContent from './MessageContent.js';
import EmbedFactory from './EmbedFactory.js';

export default class Bot extends Discord.Client {
  constructor(options={}) {
    return new Promise(async (res) => {
      super(options);
      this.owners = options.owners ?? [options.owner];
      
      this.embeds = new EmbedFactory(options.embeds);
      if (options.commands) this.commands = await new CommandManager(this, options.commands);

      res(this);
    });
  }

  async login(token) {
    if (!this.listenerCount('interactionCreate')) this.on('interactionCreate', this._onInteractionCreate);
    if (!this.listenerCount('ready')) this.once('ready', this._onReady);
    return super.login(token);
  }

  async _onReady() {
    console.log('ready!');
  }

  async _onInteractionCreate(interaction) {
    const command = this.commands.resolve(interaction.commandName);
    if (!command) return;

    try {
      const res = await command.run(interaction);
      if (res instanceof MessageContent) return interaction.replied ? interaction.followUp(res.toMsg()) : interaction.reply(res.toMsg());
    } catch (err) {
      console.log(err);
    }
  }
}