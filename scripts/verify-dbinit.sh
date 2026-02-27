#!/usr/bin/env bash
set -euo pipefail

tmp_file="$(mktemp)"
cp src/database/schema.sql "$tmp_file"

cleanup() {
  cp "$tmp_file" src/database/schema.sql
  rm -f "$tmp_file"
}

trap cleanup EXIT

echo "[verify-dbinit] failure path: empty src/database/schema.sql must fail"
: > src/database/schema.sql
if make dbinit; then
  echo "[verify-dbinit] expected failure when src/database/schema.sql is empty"
  exit 1
fi

echo "[verify-dbinit] happy path: restored src/database/schema.sql must succeed"
cp "$tmp_file" src/database/schema.sql
make dbinit

echo "[verify-dbinit] success"
