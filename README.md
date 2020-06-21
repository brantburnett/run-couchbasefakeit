# run-couchbasefakeit

Runs [CouchbaseFakeIt](https://github.com/brantburnett/couchbasefakeit) in a Docker container
on the build agent, using definition files from your repository. This allows easy configuration of buckets,
fake data, and indexes to support automated tests.

## Example

```yaml
name: Main workflow

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Run CouchbaseFakeIt
        uses: btburnett3/run-couchbasefakeit@v1
        with:
          couchbase-version: enterprise-6.5.0
          couchbase-configuration: example # Folder in your repo with CouchbaseFakeIt configuration
          couchbase-username: Administrator
          couchbase-password: password
      - name: Run Tests
        run: 'npm run test' # Couchbase will be available at couchbase://localhost
      - name: Run Container
        uses: docker://some/container
        with:
          args: couchbase://${{ env.couchbase_host }} # For a Docker container, you can use the couchbase_host variable
```

## Configuration folder

Configuration can include creating Couchbase buckets, using FakeIt to create fake data,
using couchbase-index-manager to create N1QL indexes, and creating FTS indexes. For complete
details, see [CouchbaseFakeIt](https://git.hub.com/brantburnett/couchbasefakeit).

For an example, see the [configuration folder](./example) in this repository.
