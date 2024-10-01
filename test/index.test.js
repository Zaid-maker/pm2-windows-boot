const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const startOnBoot = require("start-commander");

// Mocked logger to capture logging
const logger = {
  info: sinon.spy(),
  error: sinon.spy(),
};

// Mock the actual script being tested
const script = require("../index"); // Adjust path as necessary

describe("PM2 Windows Boot Script", () => {
  let enableStub, disableStub, statusStub;

  beforeEach(() => {
    // Reset spies and stubs before each test
    logger.info.resetHistory();
    logger.error.resetHistory();

    enableStub = sinon.stub(startOnBoot, "enableAutoStart");
    disableStub = sinon.stub(startOnBoot, "disableAutoStart");
    statusStub = sinon.stub(startOnBoot, "isAutoStartEnabled");
  });

  afterEach(() => {
    // Restore the stubs after each test
    sinon.restore();
  });

  it("should install PM2 startup successfully", (done) => {
    enableStub.yields(null); // Simulate successful install

    script.enablePm2Startup();

    expect(enableStub.calledOnce).to.be.true;
    expect(
      logger.info.calledWith("Successfully added PM2 startup registry entry.")
    ).to.be.true;
    done();
  });

  it("should fail to install PM2 startup", (done) => {
    enableStub.yields(new Error("Failed to install"));

    script.enablePm2Startup();

    expect(enableStub.calledOnce).to.be.true;
    expect(
      logger.error.calledWithMatch("Failed to add PM2 startup registry entry")
    ).to.be.true;
    done();
  });

  it("should uninstall PM2 startup successfully", (done) => {
    disableStub.yields(null); // Simulate successful uninstall

    script.removePm2Startup();

    expect(disableStub.calledOnce).to.be.true;
    expect(
      logger.info.calledWith("Successfully removed PM2 startup registry entry.")
    ).to.be.true;
    done();
  });

  it("should fail to uninstall PM2 startup", (done) => {
    disableStub.yields(new Error("Failed to uninstall"));

    script.removePm2Startup();

    expect(disableStub.calledOnce).to.be.true;
    expect(
      logger.error.calledWithMatch(
        "Failed to remove PM2 startup registry entry"
      )
    ).to.be.true;
    done();
  });

  it("should check PM2 startup status - enabled", (done) => {
    statusStub.yields(null, true); // Simulate PM2 enabled

    script.checkPm2StartupStatus();

    expect(statusStub.calledOnce).to.be.true;
    expect(logger.info.calledWith("PM2 is set to start on boot.")).to.be.true;
    done();
  });

  it("should check PM2 startup status - not enabled", (done) => {
    statusStub.yields(null, false); // Simulate PM2 disabled

    script.checkPm2StartupStatus();

    expect(statusStub.calledOnce).to.be.true;
    expect(logger.info.calledWith("PM2 is not set to start on boot.")).to.be
      .true;
    done();
  });

  it("should restart PM2 startup successfully", (done) => {
    disableStub.yields(null);
    enableStub.yields(null);

    script.restartPm2Startup();

    expect(disableStub.calledOnce).to.be.true;
    expect(enableStub.calledOnce).to.be.true;
    expect(
      logger.info.calledWith("Successfully added PM2 startup registry entry.")
    ).to.be.true;
    done();
  });

  it("should force install PM2 startup successfully", (done) => {
    disableStub.yields(null);
    enableStub.yields(null);

    script.forceInstallPm2Startup();

    expect(disableStub.calledOnce).to.be.true;
    expect(enableStub.calledOnce).to.be.true;
    expect(
      logger.info.calledWith("Successfully added PM2 startup registry entry.")
    ).to.be.true;
    done();
  });
});
