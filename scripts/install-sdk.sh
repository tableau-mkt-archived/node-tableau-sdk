#!/bin/bash

LOCAL_SDK_VERSION=${TABLEAU_SDK_VERSION:-9-3-0}

# Install the SDK for linux
if [ $TRAVIS_OS_NAME == 'linux' ]; then
  wget --directory-prefix=$HOME/tableau-c-sdk https://downloads.tableau.com/tssoftware/Tableau-SDK-Linux-64Bit-${LOCAL_SDK_VERSION}.deb
  sudo dpkg -i $HOME/tableau-c-sdk/Tableau-SDK-Linux-64Bit-${LOCAL_SDK_VERSION}.deb
fi

# Install the SDK for OSX.
if [ $TRAVIS_OS_NAME == 'osx' ]; then
  wget --directory-prefix=$HOME/tableau-c-sdk https://downloads.tableau.com/tssoftware/Tableau-SDK-${LOCAL_SDK_VERSION}.dmg
  sudo hdiutil attach $HOME/tableau-c-sdk/Tableau-SDK-${LOCAL_SDK_VERSION}.dmg
  sudo ditto /Volumes/Tableau\ SDK/Frameworks/ /Library/Frameworks/
fi
