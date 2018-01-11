#!/bin/bash

LOCAL_SDK_VERSION=${TABLEAU_SDK_VERSION:-10-2-0}

# Install the SDK for linux
if [ $TRAVIS_OS_NAME == 'linux' ]; then
  wget --directory-prefix=$HOME/tableau-c-sdk https://downloads.tableau.com/tssoftware/extractapi-linux-x86_64-${LOCAL_SDK_VERSION}.deb
  sudo dpkg -i $HOME/tableau-c-sdk/extractapi-linux-x86_64-${LOCAL_SDK_VERSION}.deb
fi

# Install the SDK for OSX.
if [ $TRAVIS_OS_NAME == 'osx' ]; then
  wget --directory-prefix=$HOME/tableau-c-sdk https://downloads.tableau.com/tssoftware/extractapi-${LOCAL_SDK_VERSION}.dmg
  sudo hdiutil attach $HOME/tableau-c-sdk/extractapi-${LOCAL_SDK_VERSION}.dmg
  sudo ditto /Volumes/Tableau\ SDK/Frameworks/ /Library/Frameworks/
fi
