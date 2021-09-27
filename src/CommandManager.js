import Discord from 'discord.js-light';
import FZ from 'file-ez';

export default class CommandManager {
  constructor(client, path) {
    return new Promise(async (res) => {
      this.client = client;
      this.cache = new Discord.Collection();
      for (const file of await FZ.getDir(path).getDeep()) {
        const cmd = await import(file.toString()).then(mod=>mod.default).catch(console.log);
        if (!cmd) return;
        this.cache.set(cmd.name, cmd);
      }
      res(this);
    });
  }

  resolve(name) {
    return this.cache.find(c=>c.name===name||c.aliases?.includes(name));
  }
}