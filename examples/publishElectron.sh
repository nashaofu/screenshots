#！/bin/bash

cd ..

home=$(pwd)

electron_screenshot=$home"/packages/electron-screenshots"


cd $electron_screenshot
yarn add akey-react-screenshots@1.0.16-beta.3
yarn add akey-screenshot-desktop@1.14.3

npm publish --tag beta
