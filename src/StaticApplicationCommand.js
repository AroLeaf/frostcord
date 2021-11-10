import CommandFlags from './CommandFlags.js';
import Discord from 'discord.js';

export default class StaticApplicationCommand {
  constructor(data) {
    this.data = data;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type||1;
    this.options = data.options;
    this.function = data.run;
    
    this.flags = new CommandFlags(data.flags).freeze();
    this.permissions = {
      self: new Discord.Permissions(data.permissions?.self).freeze(),
      user: new Discord.Permissions(data.permissions?.user).freeze(),
    }
  }
  
  get category() {
    return this.path ? Path.basename(Path.dirname(this.path)) : undefined;
  }

  async run(interaction) {
    if (this.flags.has(1<<0) && !interaction.client.owners.includes(interaction.user.id)) return;
    if (this.flags.has(1<<1) && !interaction.guild) return interaction.embed('This command can only be used in a server.');
    
    if (!interaction.member.permissionsIn(interaction.channel).has(this.permissions.user)) return interaction.embed('You\'re missing permissions.');
    if (!interaction.guild.me.permissionsIn(interaction.channel).has(this.permissions.self)) return interaction.embed('I\'m missing permissions.');

    return this.function(interaction);
  }
};