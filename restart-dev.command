#!/bin/bash
cd ~/Documents/mapped
killall -9 node 2>/dev/null
sleep 2
rm -rf .next
npm run dev
