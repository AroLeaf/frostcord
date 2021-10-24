import Discord from 'discord.js';

import _Bot from './src/Bot.js';
import _Command from './src/Command.js';
import _CommandFlags from './src/CommandFlags.js';
import _CommandManager from './src/CommandManager.js';
import _CooldownManager from './src/CooldownManager.js';
import _MessageContent from './src/MessageContent.js';
import _Oauth from './src/Oauth.js';

export default {
  ...Discord,
  Bot: _Bot,
  Command: _Command,
  CommandFlags: _CommandFlags,
  CommandManager: _CommandManager,
  CooldownManager: _CooldownManager,
  MessageContent: _MessageContent,
  Oauth: _Oauth,
}

export const Bot = _Bot;
export const Command = _Command;
export const CommandFlags = _CommandFlags;
export const CommandManager = _CommandManager;
export const CooldownManager = _CooldownManager;
export const MessageContent = _MessageContent;
export const Oauth = _Oauth;