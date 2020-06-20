import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function cleanup() {
  try {
    await exec.exec('docker', [
      'stop',
      'couchbasefakeit'
    ], {
      silent: true,
      ignoreReturnCode: true
    });
  } catch (e) {
    core.setFailed(e.message);
  }
}

cleanup();
