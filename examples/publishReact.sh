#！/bin/bash

cd ..

home=$(pwd)

react_screenshot=$home"/packages/react-screenshots"


cd $react_screenshot

npm publish --tag beta
