const { MongoMemoryServer } = require('mongodb-memory-server');
(async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('MONGOMEM URI=' + uri);
    console.log('Keep this process running to keep the in-memory MongoDB alive.');
    // Prevent exit
    process.stdin.resume();
    // Handle shutdown
    const cleanup = async () => { console.log('Stopping in-memory MongoDB...'); await mongod.stop(); process.exit(0); };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (err) {
    console.error('Failed to start in-memory MongoDB', err);
    process.exit(1);
  }
})();
