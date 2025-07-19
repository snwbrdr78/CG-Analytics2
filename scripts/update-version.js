#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current commit count for build number
const commitCount = parseInt(execSync('git rev-list --count HEAD').toString().trim());
const nextBuildNumber = commitCount + 1;

// Parse current version from root package.json
const rootPackage = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const currentVersion = rootPackage.version;
const [major, minor] = currentVersion.split('.');

// New version with updated build number
const newVersion = `${major}.${minor}.${nextBuildNumber}`;

console.log(`Updating version from ${currentVersion} to ${newVersion}`);

// Files to update
const filesToUpdate = [
  '../package.json',
  '../backend/package.json',
  '../frontend/package.json',
  '../version.json'
];

// Update package.json files
filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (file.endsWith('version.json')) {
    // Update version.json with detailed format
    const versionData = {
      major: parseInt(major),
      minor: parseInt(minor),
      build: nextBuildNumber,
      version: newVersion
    };
    fs.writeFileSync(filePath, JSON.stringify(versionData, null, 2) + '\n');
    console.log(`✓ Updated ${file}`);
  } else {
    // Update package.json files
    try {
      const packageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      packageData.version = newVersion;
      fs.writeFileSync(filePath, JSON.stringify(packageData, null, 2) + '\n');
      console.log(`✓ Updated ${file}`);
    } catch (error) {
      console.error(`✗ Failed to update ${file}:`, error.message);
    }
  }
});

console.log(`\nVersion updated to ${newVersion} successfully!`);
console.log('Remember to commit these changes.');