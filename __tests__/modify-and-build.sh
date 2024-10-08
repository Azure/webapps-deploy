#!/bin/bash

set -e

case $1 in

 "dotnet")
    cp -r ./__tests__/dotnetsampleapp dotnetapp
    cd dotnetapp

    current_utc_time=$(date -u +"%Y-%m-%d %H:%M:%S %Z")
    sed -i "s/<<<net-place-holder>>>/$current_utc_time/g" Controllers/HelloController.cs

    # Build the app
    dotnet build --configuration Release

    echo "Modification and build completed successfully."
 ;;

 "nodejs")
    cp -r ./__tests__/nodesampleapp nodeapp
    cd nodeapp

    current_utc_time=$(date -u +"%Y-%m-%d %H:%M:%S %Z")
    sed -i "s/<<<node-place-holder>>>/$current_utc_time/g" server.js

    # Build the app
    npm install
    npm run build --if-present

    echo "Modification and build completed successfully."
 ;;

esac

