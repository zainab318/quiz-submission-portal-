const { exec } = require('child_process');

const port = process.env.PORT || 3000;

console.log(`Starting server on port ${port}...`);

// Use exec to run the serve command with proper port handling
exec(`npx serve -s build -l ${port}`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
  if (stderr) {
    console.error('Server stderr:', stderr);
  }
  console.log('Server stdout:', stdout);
});
