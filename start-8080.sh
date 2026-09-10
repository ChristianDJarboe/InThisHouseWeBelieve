#!/usr/bin/env bash
cd "/c/Users/Admin/Documents/InThisHouseWeBelieve" || exit 1
echo "Starting InThisHouseWeBelieve on http://localhost:8080 ..."
node server/src/index.js
status=$?
echo
echo "Server exited with code $status. Press Enter to close."
read
