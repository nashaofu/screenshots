#！/bin/bash

cd ..

home=$(pwd)

electron_screenshot=$home"/packages/electron-screenshots"


cd $electron_screenshot
yarn add akey-react-screenshots@1.0.15
yarn build
