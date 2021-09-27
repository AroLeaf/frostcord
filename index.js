import Discord from 'discord.js-light';

import Bot from './src/Bot.js';
import Command from './src/Command.js';
import CommandFlags from './src/CommandFlags.js';
import CommandManager from './src/CommandManager.js';

export default {
  ...Discord,
  Bot,
  Command,
  CommandFlags,
  CommandManager,
}