import CommandFlags from "./CommandFlags.js";
import Discord from "discord.js";
import Path from 'path';

export default class Command {
  constructor(data) {
    this.name = data.name;
    this.description = data.description||'';
    this.aliases = data.aliases;
    this.args = data.args;
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

  async run(message, args) {
    if (this.flags.has(1<<0) && !message.client.owners.includes(message.author.id)) return;
    if (this.flags.has(1<<1) && !message.guild) return message.embed('This command can only be used in a server.');
    
    if (!message.member.permissionsIn(message.channel).has(this.permissions.user)) return message.embed('You\'re missing permissions.');
    if (!message.guild.me.permissionsIn(message.channel).has(this.permissions.self)) return message.embed('I\'m missing permissions.');


    if (this.args) {
      const parsed = new Discord.Collection();
      parsed.raw = args;

      for (const arg of this.args) {
        const input = args[parsed.size];

        const value = await (async () => {
          if (!input) return;
          switch (arg.type) {
            case 'USER': {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              return await message.client.users.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 'MEMBER': {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              return await message.guild?.members.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 'ROLE': {
              const match = input.match(/^(\d+)|<@&(\d+)>$/);
              return await message.guild?.roles.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 'CHANNEL': {
              const match = input.match(/^(\d+)|<#(\d+)>$/);
              return await message.guild?.channels.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 'MESSAGE': {
              return await message.channel.messages.fetch(input).catch(()=>{});
            }
            case 'NUMBER': {
              const number = Number(input);
              if(!Number.isNaN(number)) return number;
              if (arg.required) throw new Errors.UserError(`\`${input}\` is not a number.`);
            }
            case 'STRING': {
              return arg.choices ? arg.choices.find(c=>c.name==input)?.value : input;
            }
            case 'TAIL': {
              return args.slice(parsed.size).join(' ');
            }
          }
        })();

        if (!value || (arg.choices && !arg.choices.map(c=>c.name).includes(value.id||value))) {
          if (arg.required) return message.embed('Missing argument(s)');
          if (input&&arg.strict) message.embed('Invalid argument(s)');
          continue;
        }
        parsed.set(arg.name, value);
      }
      args = parsed;
    }


    return this.function(message, args);
  }



  static args(args) {
    switch (args.constructor) {
      case Array: return args.map(arg=>Command.args(arg)[0]);
      case String: return [{ name: args.toLowerCase(), description: args}];
      default: {
        return [{
          name: args.name,
          description: args.description||args.name,
          type: args.type||'STRING',
          required: args.required??false,
          strict: args.strict??true,
          choices: args.choices,
        }];
      }
    }
  }

  static choices(choices) {
    return choices.map(c=>{return{name:c,value:c}});
  }
}