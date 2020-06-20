import * as core from '@actions/core';
import * as child_process from 'child_process';

export async function run() {
  let version: string = core.getInput('couchbase-version');

  console.log(`Version: ${version}`);
}
