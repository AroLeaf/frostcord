import CommandFlags from './CommandFlags.js';
import Discord from 'discord.js';
import Path from 'path';

export default class Command {
  constructor(data) {
    this.name = data.name;
    this.description = data.description||'';
    this.aliases = data.aliases;
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

  async run(message, args) {
    if (this.flags.has(1<<0) && !message.client.owners.includes(message.author.id)) return;
    if (this.flags.has(1<<1) && !message.guild) return message.embed('This command can only be used in a server.');
    
    if (!message.member.permissionsIn(message.channel).has(this.permissions.user)) return message.embed('You\'re missing permissions.');
    if (!message.guild.me.permissionsIn(message.channel).has(this.permissions.self)) return message.embed('I\'m missing permissions.');


    if (this.options) {
      const parsed = new Discord.Collection();
      parsed.raw = args;

      for (const arg of this.options) {
        const input = args[parsed.size];

        const choice = i => arg.choices ? arg.choices.find(c=>c.name===input)?.value : i;

        const value = await (async () => {
          if (!input) return;
          switch (arg.type) {
            case 0:
            case 'STRING': {
              return choice(input);
            }
            case 1:
            case 'NUMBER': {
              const number = Number(input);
              return choice(Number.isFinite(number) && number);
            }
            case 2:
            case 'INTEGER': {
              const int = parseInt(input);
              return choice(Number.isSafeInteger(int) && int);
            }
            case 3:
            case '@':
            case 'USER': {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              return await message.client.users.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 4:
            case '@!':
            case 'MEMBER': {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              return await message.guild?.members.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 5:
            case '@?':
            case'MEMBER_OR_USER': {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              return await message.guild?.members.fetch(match?.[1] || match?.[2]).catch(()=>{}) 
                  || await message.client.users.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 6:
            case '@&':
            case 'ROLE': {
              const match = input.match(/^(\d+)|<@&(\d+)>$/);
              return await message.guild?.roles.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 7:
            case '#':
            case 'CHANNEL': {
              const match = input.match(/^(\d+)|<#(\d+)>$/);
              return await message.guild?.channels.fetch(match?.[1] || match?.[2]).catch(()=>{});
            }
            case 8:
            case 'MESSAGE': {
              return await message.channel.messages.fetch(input).catch(()=>{});
            }
            case 9:
            case '*':
            case 'TAIL': {
              return args.slice(parsed.size).join(' ');
            }
          }
        })();

        if (!value || (arg.choices && !arg.choices.map(c=>c.name).includes(value.id||value))) {
          if (input && (arg.strict || arg.required)) return message.embed('Invalid argument(s)');
          if (arg.required) return message.embed('Missing argument(s)');
          continue;
        }
        parsed.set(arg.name, value);
      }
      args = parsed;
    }


    return this.function(message, args);
  }



  static options(options) {
    switch (options.constructor) {
      case Array: return options.map(arg=>Command.args(arg)[0]);
      case String: return [{ name: options.toLowerCase(), description: options}];
      default: {
        return [{
          name: options.name,
          description: options.description??options.name,
          type: options.type??'STRING',
          required: options.required??false,
          strict: options.strict??true,
          choices: options.choices,
        }];
      }
    }
  }

  static choices(choices) {
    return choices.map(c=>{return{name:c,value:c}});
  }
}