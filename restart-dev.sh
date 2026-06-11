#!/bin/bash
# Kill any running node/next dev servers
killall -9 node 2>/dev/null
sleep 1
# Clean corrupted Turbopack cache
rm -rf .next
# Restart dev server
npm run dev
