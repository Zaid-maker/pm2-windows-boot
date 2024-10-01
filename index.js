#!/usr/bin/env node

const startOnBoot = require("start-commander");
const argv = require("yargs")
  .usage("Usage: pm2-startup <command>")
  .command("install", "Adds a registry entry which resurrects PM2 on startup.")
  .command(
    "uninstall",
    "Removes the registry entry which resurrects PM2 on startup."
  )
  .demand(1).argv._;

const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "pm2-windows-boot.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const applicationName = "PM2";
const applicationCommand =
  'wscript.exe "' +
  __dirname +
  '\\invisible.vbs" "' +
  __dirname +
  '\\pm2_resurrect.cmd"';

switch (argv[0]) {
  case "install":
    enablePm2Startup();
    break;

  case "uninstall":
    removePm2Startup();
    break;

  default:
    logger.error("Invalid command: " + argv[0]);
}

function enablePm2Startup() {
  try {
    startOnBoot.enableAutoStart(
      applicationName,
      applicationCommand,
      (error) => {
        if (error) {
          logger.error("Failed to add PM2 startup registry entry", error);
        } else {
          logger.info("Successfully added PM2 startup registry entry.");
        }
      }
    );
  } catch (err) {
    logger.error("Exception in enablePm2Startup", err);
  }
}

function removePm2Startup() {
  try {
    startOnBoot.disableAutoStart(applicationName, (error) => {
      if (error) {
        logger.error("Failed to remove PM2 startup registry entry", error);
      } else {
        logger.info("Successfully removed PM2 startup registry entry.");
      }
    });
  } catch (err) {
    logger.error("Exception in removePm2Startup", err);
  }
}
