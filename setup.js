#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Quiz Portal Setup');
console.log('====================\n');

function createEnvFile(apiKey) {
  const envContent = `# OpenAI API Configuration
REACT_APP_OPENAI_API_KEY=${apiKey}

# Optional: Custom API endpoint (if using a proxy)
# REACT_APP_OPENAI_API_BASE=https://your-proxy-endpoint.com

# Optional: Model configuration
# REACT_APP_OPENAI_MODEL=gpt-3.5-turbo
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully!');
}

function checkEnvFile() {
  if (fs.existsSync('.env')) {
    console.log('⚠️  .env file already exists. Skipping creation.');
    return true;
  }
  return false;
}

async function setup() {
  console.log('This script will help you set up your Quiz Portal application.\n');
  
  if (!checkEnvFile()) {
    rl.question('Please enter your OpenAI API key: ', (apiKey) => {
      if (!apiKey || apiKey.trim() === '') {
        console.log('❌ API key is required. Please run the setup again.');
        rl.close();
        return;
      }
      
      createEnvFile(apiKey.trim());
      
      console.log('\n🎉 Setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Run "npm install" to install dependencies');
      console.log('2. Run "npm start" to start the development server');
      console.log('3. Open http://localhost:3000 in your browser');
      console.log('\nHappy learning! 📚');
      
      rl.close();
    });
  } else {
    console.log('\n✅ Environment file already exists.');
    console.log('\nTo start the application:');
    console.log('1. Run "npm install" (if not already done)');
    console.log('2. Run "npm start"');
    console.log('3. Open http://localhost:3000 in your browser');
    
    rl.close();
  }
}

setup().catch(console.error);
