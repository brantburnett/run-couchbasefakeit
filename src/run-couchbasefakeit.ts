import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function run() {
  try {
    const registry: string = core.getInput('couchbase-registry');
    const tag: string = core.getInput('couchbase-version');

    const image: string = `${registry}:${tag}`;

    console.log(`Launching Couchbase using ${image}`);

    let command = 'docker run -d --name couchbasefakeit';
    command += ' -p 8091-8096:8091-8096 -p 11210:11210'
    command += image;

    console.log(`Command: ${command}`);

    const returnCode = await exec.exec('docker', [
      'run',
      '-d', '--rm',
      '-p', '8091-8096:8091-8096',
      '-p', '11210:11210',
      image
    ]);

    if (returnCode !== 0) {
      core.setFailed(`Error: ${returnCode}`);
    }

    await new Promise((resolve) => {
      setTimeout(() => resolve(), 30000);
    });

    await exec.exec('docker', [
      'stop',
      'couchbasefakeit'
    ]);
  } catch (e) {
    core.setFailed(e.message);
  }
}

run();
