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

    const image: string = `${registry}:${tag}`;

    core.info(`Launching Couchbase using ${image}`);

    const nodestatusDir = await fs.promises.mkdtemp('/tmp/');

    const returnCode = await exec.exec('docker', [
      'run',
      '-d', '--rm',
      '--name', 'couchbasefakeit',
      '-p', '8091-8096:8091-8096',
      '-p', '11210:11210',
      '-v', `${process.cwd()}/example:/startup`,
      '-v', `${nodestatusDir}:/nodestatus`,
      image
    ]);

    if (returnCode !== 0) {
      return;
    }

    // Wait for the node initialized file
    core.info('Waiting for initialization...');

    let initialized = false;
    for (let attempt=0; attempt<60; attempt++) {
      await delay(1000);

      if (fs.existsSync(`${nodestatusDir}/initialized`)) {
        initialized = true;
        break;
      }
    }

    if (!initialized) {
      core.setFailed('Timeout during initialization');
    }

    // Print logs
    await exec.exec('docker', [
      'logs',
      'couchbasefakeit'
    ]);

    // Shut down the docker container

    await exec.exec('docker', [
      'stop',
      'couchbasefakeit'
    ]);
  } catch (e) {
    core.setFailed(e.message);
  }
}

run();
