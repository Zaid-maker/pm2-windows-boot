#!/usr/bin/env node

const startOnBoot = require('start-on-windows-boot');
const yargs = require('yargs');

const argv = yargs
  .usage('Usage: pm2-startup <command>')
  .command('install', 'Adds a registry entry which resurrects PM2 on startup.')
  .command('uninstall', 'Removes the registry entry which resurrects PM2 on startup.')
  .demandCommand(1)
  .argv;
