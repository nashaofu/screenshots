#！/bin/bash

cd ..

home=$(pwd)

react_screenshot=$home"/packages/react-screenshots"
electron_screenshot=$home"/packages/electron-screenshots"
desktop_screenshot=$home"/packages/screenshot-desktop"
example=$home"/examples"

echo $react_screenshot
yarn build

cd $electron_screenshot
yarn add $react_screenshot
yarn add $desktop_screenshot
yarn build


cd $example
yarn add $electron_screenshot
yarn start