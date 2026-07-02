#!/usr/bin/env node
const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');

(async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('Started in-memory MongoDB at', uri);

    const env = Object.assign({}, process.env, {
      MONGODB_URI: uri,
      JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret'
    });

    const repoRoot = require('path').resolve(__dirname, '..');
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(cmd, ['run', 'dev'], {
      env,
      stdio: 'inherit',
      shell: true,
      cwd: repoRoot
    });

    child.on('exit', async (code) => {
      console.log('Dev server exited with code', code);
      try { await mongod.stop(); console.log('Stopped in-memory MongoDB'); } catch (e) { console.error('Error stopping mongod', e); }
      process.exit(code);
    });

    process.on('SIGINT', async () => { child.kill('SIGINT'); });
    process.on('SIGTERM', async () => { child.kill('SIGTERM'); });
  } catch (err) {
    console.error('Failed to start in-memory MongoDB:', err);
    process.exit(1);
  }
})();
