#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '..', 'version.json');
const packageFile = path.join(__dirname, '..', 'package.json');

// Read current version
const version = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

// Get the type of version bump from command line argument
const bumpType = process.argv[2] || 'build';

switch (bumpType) {
  case 'major':
    version.major++;
    version.minor = 0;
    version.build = 0;
    break;
  case 'minor':
    version.minor++;
    version.build = 0;
    break;
  case 'build':
  default:
    version.build++;
    break;
}

// Update version string
version.version = `${version.major}.${version.minor}.${version.build}`;

// Write updated version
fs.writeFileSync(versionFile, JSON.stringify(version, null, 2));

// Update package.json version
packageJson.version = version.version;
fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2));

console.log(`Version bumped to ${version.version}`);