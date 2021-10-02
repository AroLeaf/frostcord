import Discord from 'discord.js';

import Bot from './src/Bot.js';
import Command from './src/Command.js';
import CommandFlags from './src/CommandFlags.js';
import CommandManager from './src/CommandManager.js';
import Oauth from './src/Oauth.js';

export default {
  ...Discord,
  Bot,
  Command,
  CommandFlags,
  CommandManager,
  Oauth,
}