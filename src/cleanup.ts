import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function cleanup() {
  try {
    core.info('Stopping Couchbase...');

    await exec.exec('docker', ['stop', 'couchbasefakeit']);
    await exec.exec('docker', ['rm', 'couchbasefakeit']);
  } catch (e) {
    core.setFailed(e.message);
  }
}

cleanup();
