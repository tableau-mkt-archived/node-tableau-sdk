#!/bin/bash

# Install the SDK for linux
if [ $TRAVIS_OS_NAME == 'linux' ]; then
  wget --directory-prefix=$HOME/tableau-c-sdk https://downloads.tableau.com/tssoftware/Tableau-SDK-Linux-64Bit-9-3-0.deb
  sudo dpkg -i $HOME/tableau-c-sdk/Tableau-SDK-Linux-64Bit-9-3-0.deb
fi

# Install the SDK for OSX.
if [ $TRAVIS_OS_NAME == 'osx' ]; then
  wget --directory-prefix=$HOME/tableau-c-sdk https://downloads.tableau.com/tssoftware/Tableau-SDK-9-3-0.dmg
  sudo hdiutil attach $HOME/tableau-c-sdk/Tableau-SDK-9-3-0.dmg
  sudo cp -r /Volumes/Tableau\ SDK/Frameworks/ /Library/Frameworks/
fi
