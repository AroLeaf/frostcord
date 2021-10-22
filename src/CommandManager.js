import Discord from 'discord.js';
import FZ from 'file-ez';
import { pathToFileURL as toUrl } from 'url';

export default class CommandManager {
  constructor(client, path) {
    return new Promise(async (res) => {
      this.client = client;
      this.cache = new Discord.Collection();
      for (const file of await FZ.getDir(path).getDeep()) {
        const cmd = await import(toUrl(file.toString())).then(mod=>mod.default).catch(console.log);
        if (!cmd) return;
        cmd.path = file.toString();
        this.cache.set(cmd.name, cmd);
      }
      res(this);
    });
  }

  resolve(name) {
    return this.cache.find(c=>c.name===name||c.aliases?.includes(name));
  }
}