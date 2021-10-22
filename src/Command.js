import CommandFlags from "./CommandFlags.js";
import Discord from "discord.js";
import Path from 'path';

export default class Command {
  constructor(data) {
    this.name = data.name;
    this.description = data.description||'';
    this.aliases = data.aliases;
    this.flags = new CommandFlags(data.flags).freeze();
    this.permissions = {
      self: new Discord.Permissions(data.permissions?.self).freeze(),
      user: new Discord.Permissions(data.permissions?.user).freeze(),
    }
    this.function = data.run;
  }

  get category() {
    return this.path ? Path.basename(Path.dirname(this.path)) : undefined;
  }

  async run(message, args) {
    if (this.flags.has(1<<0) && message.author.id !== message.client.owner) return;
    if (this.flags.has(1<<1) && !message.guild) return;
    
    if (!message.member.permissionsIn(message.channel).has(this.permissions.user)) return console.log('user missing permission(s)');;
    if (!message.guild.me.permissionsIn(message.channel).has(this.permissions.self)) return console.log('bot missing permission(s)');;

    return this.function(message, args);
  }
}