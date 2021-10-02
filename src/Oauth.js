import fetch from 'node-fetch';

export default {
  async user(options) {
    const res = await fetch('https://discord.com/api/v9/users/@me', { headers: { Authorization: `Bearer ${options.access_token}` } });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  },

  async refresh(options) {
    const res = await fetch('https://discord.com/api/v9/oauth2/token', { method: 'POST', body: new URLSearchParams({
      ...options,
      grant_type: 'refresh_token',
    }) });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  },

  async token(options) {
    const res = await fetch('https://discord.com/api/v9/oauth2/token', { method: 'POST', body: new URLSearchParams({
      ...options,
      grant_type: 'authorization_code',
    }) });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  },

  async guilds(options) {
    const res = await fetch('https://discord.com/api/v9/users/@me/guilds', { headers: { Authorization: `Bearer ${options.access_token}` } });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  }
}