#!/bin/bash
cd react-app
npm install
npm run-script build
cd ..
go get ./...
go run main.go
