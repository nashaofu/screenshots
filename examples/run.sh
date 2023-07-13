#！/bin/bash

cd ..

home=$(pwd)

react_screenshot=$home"/packages/react-screenshots"
electron_screenshot=$home"/packages/electron-screenshots"
example=$home"/examples"

echo $react_screenshot
yarn build

cd $electron_screenshot
yarn add $react_screenshot
yarn build


cd $example
yarn add $electron_screenshot
yarn start