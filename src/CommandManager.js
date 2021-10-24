import Discord from 'discord.js';
import { getDir } from 'file-ez';

export default class CommandManager {
  constructor(client, path) {
    return new Promise(async (res) => {
      this.client = client;
      this.cache = new Discord.Collection();
      for (const file of await getDir(path, 8).recursive()) {
        const cmd = await file.import().catch(console.log);
        if (!cmd) return;
        cmd.path = file.path;
        this.cache.set(cmd.name, cmd);
      }
      res(this);
    });
  }

  resolve(name) {
    return this.cache.find(c=>c.name==name||c.aliases?.includes(name));
  }
}