import env from './config/env.mjs';
import app from './app.mjs';

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
