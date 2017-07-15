#!/bin/bash
set -e

scripts_root=build-scripts/
test -d $scripts_root || (echo "script must be executed from the root of the repo" && exit 1)

echo "=== SIGNING ==="
$scripts_root/android-sign.sh

echo "=== PUBLISH ==="
$scripts_root/android-publish-hockeyapp.sh
