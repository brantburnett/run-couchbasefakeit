import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';

function delay(timeoutMs: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeoutMs);
  });
}

export async function run() {
  try {
    const registry: string = core.getInput('couchbase-registry');
    const tag: string = core.getInput('couchbase-version');
    const configDir = core.getInput('couchbase-configuration');
    const userName = core.getInput('couchbase-username');
    const password = core.getInput('couchbase-password');
    const services = core.getInput('couchbase-services');
    core.setSecret(password);

    const image: string = `${registry}:${tag}`;

    core.info(`Launching Couchbase using ${image}`);

    const nodestatusDir = await fs.promises.mkdtemp('/tmp/');

    const returnCode = await exec.exec('docker', [
      'run',
      '-d',
      '--rm',
      '--name',
      'couchbasefakeit',
      '-p',
      '8091-8096:8091-8096',
      '-p',
      '11210:11210',
      '-e',
      'CB_STOPONERROR=1',
      '-e',
      `CB_USERNAME=${userName}`,
      '-e',
      `CB_PASSWORD=${password}`,
      '-e',
      `CB_SERVICES=${services}`,
      '-v',
      `${process.cwd()}/${configDir}:/startup`,
      '-v',
      `${nodestatusDir}:/nodestatus`,
      image
    ]);

    if (returnCode !== 0) {
      return;
    }

    // Wait for the node initialized file
    core.info('Waiting for initialization...');

    let initialized = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      await delay(1000);

      if (fs.existsSync(`${nodestatusDir}/initialized`)) {
        initialized = true;
        break;
      }

      if (fs.existsSync(`${nodestatusDir}/errors`)) {
        // Wait for all errors
        await exec.exec('docker', ['wait', 'couchbasefakeit']);

        // Print logs
        await exec.exec('docker', ['logs', 'couchbasefakeit']);

        // Short circuit
        core.setFailed('Errors initializing CouchbaseFakeIt.');
        return;
      }
    }

    if (!initialized) {
      core.setFailed('Timeout during CouchbaseFakeIt initialization.');
    } else {
      core.info('CouchbaseFakeIt initialized.');

      let ip = '';
      // Get the hostname
      await exec.exec('hostname', ['-i'], {
        listeners: {
          stdout: (data: Buffer) => {
            ip += data.toString();
          }
        }
      });

      ip = ip.trim();
      core.exportVariable('couchbase_host', ip);
    }

    // Print logs
    await exec.exec('docker', ['logs', 'couchbasefakeit']);
  } catch (e) {
    core.setFailed(e.message);
  }
}

run();
