#!/usr/bin/env node

const startOnBoot = require("start-commander");
const fs = require("fs");
const argv = require("yargs")
  .usage("Usage: pm2-startup <command> [options]")
  .command("install", "Adds a registry entry which resurrects PM2 on startup.")
  .command(
    "uninstall",
    "Removes the registry entry which resurrects PM2 on startup."
  )
  .command("status", "Checks if PM2 is set to start on boot.")
  .command("restart", "Reinstalls the startup entry for PM2.")
  .command(
    "force-install",
    "Removes and then installs the startup entry for PM2."
  )
  .option("verbose", {
    alias: "v",
    description: "Enable verbose logging",
    type: "boolean",
  })
  .demand(1).argv._;

const winston = require("winston");

// Setup logger with optional verbose mode
const logger = winston.createLogger({
  level: argv.verbose ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Custom timestamp format
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "pm2-windows-boot.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    }),
  ],
});

const applicationName = "PM2";
const applicationCommand =
  'wscript.exe "' +
  __dirname +
  '\\\\invisible.vbs" "' +
  __dirname +
  '\\\\pm2_resurrect.cmd"';

switch (argv[0]) {
  case "install":
    enablePm2Startup();
    break;

  case "uninstall":
    removePm2Startup();
    break;

  case "status":
    checkPm2StartupStatus();
    break;

  case "restart":
    restartPm2Startup();
    break;

  case "force-install":
    forceInstallPm2Startup();
    break;

  default:
    logger.error("Invalid command: " + argv[0]);
}

// Install PM2 startup
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

// Uninstall PM2 startup
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

// Check if PM2 is set to start on boot
function checkPm2StartupStatus() {
  try {
    startOnBoot.isAutoStartEnabled(applicationName, (error, enabled) => {
      if (error) {
        logger.error("Failed to check PM2 startup status", error);
      } else if (enabled) {
        logger.info("PM2 is set to start on boot.");
      } else {
        logger.info("PM2 is not set to start on boot.");
      }
    });
  } catch (err) {
    logger.error("Exception in checkPm2StartupStatus", err);
  }
}

// Restart PM2 startup by uninstalling and reinstalling
function restartPm2Startup() {
  removePm2Startup();
  enablePm2Startup();
}

// Force install PM2 startup by removing any existing entry first
function forceInstallPm2Startup() {
  removePm2Startup();
  enablePm2Startup();
}
