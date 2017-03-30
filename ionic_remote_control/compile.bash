#!/bin/bash
cordova build --release android
keytool -genkey -v -keystore my-release-key.keystore -alias magic_air_conditioner -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore magic-air-conditioner-release-unsigned.apk magic_air_conditioner
rm magic-air-conditioner.apk
zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk magic-air-conditioner.apk
