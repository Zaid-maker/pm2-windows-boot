#!/usr/bin/env node

const startOnBoot = require('start-on-windows-boot');
const yargs = require('yargs');

const argv = yargs
  .usage('Usage: pm2-startup <command>')
  .command('install', 'Adds a registry entry which resurrects PM2 on startup.')
  .command('uninstall', 'Removes the registry entry which resurrects PM2 on startup.')
  .demandCommand(1)
  .argv;

var applicationName = 'PM2';
var applicationCommand = `wscript.exe "${__dirname}\\invisible.vbs" "${__dirname}\\pm2_resurrect.cmd"`;

switch (argv[0]) {
  case 'install':
    enablePm2Startup();
    break;

  case 'uninstall':
    removePm2Startup();
    break;

  default:
    console.log('Invalid command. Please provide either "install" or "uninstall" as a command.');
}

