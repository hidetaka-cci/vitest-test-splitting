#!/usr/bin/env bash
set -euo pipefail

DEFINITION_ID="1e4c40a1-698f-5178-991d-0753dae07670"
SLUG="gh/hidetaka-cci/vitest-test-splitting"
BRANCH="${1:-main}"
TOKEN=$(grep '^token:' ~/.circleci/cli.yml | awk '{print $2}')

RESP=$(curl -sS -X POST -H "Circle-Token: $TOKEN" -H "Content-Type: application/json" \
  -d "{\"definition_id\":\"$DEFINITION_ID\",\"config\":{\"branch\":\"$BRANCH\"},\"checkout\":{\"branch\":\"$BRANCH\"}}" \
  "https://circleci.com/api/v2/project/$SLUG/pipeline/run")

echo "$RESP" | python3 -m json.tool
PIPE_ID=$(echo "$RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
echo "Pipeline ID: $PIPE_ID"
echo "https://app.circleci.com/pipelines/$SLUG/$PIPE_ID"
