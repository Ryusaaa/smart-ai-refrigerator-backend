import dns from 'node:dns';
import env from './config/env.mjs';
import app from './app.mjs';

dns.setDefaultResultOrder('ipv4first');

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});