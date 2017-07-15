#!/bin/bash
set -e

alias=SUGSA-conference-app
APK=platforms/android/build/outputs/apk/android-release-unsigned.apk
OUT=android-release.apk

a=${ANDROID_RELEASE_SIGN_PASS?"env variable ANDROID_RELEASE_SIGN_PASS not defined"}
ANDROID_KEYSTORE=${ANDROID_KEYSTORE:-SUGSA-conference-app.keystore}
echo "using keystore file: $ANDROID_KEYSTORE"

echo "signing"
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
    -keystore $ANDROID_KEYSTORE \
    -storepass $ANDROID_RELEASE_SIGN_PASS \
    -keypass $ANDROID_RELEASE_SIGN_PASS \
    $APK $alias

echo "available build tool versions"
ls -1r $ANDROID_HOME/build-tools/
ANDROID_TOOL_VERSION=$(ls -1r $ANDROID_HOME/build-tools/ | grep -v '\-preview' | head -1)
echo "using $ANDROID_TOOL_VERSION"

echo "zipalign"
rm -f $OUT
$ANDROID_HOME/build-tools/$ANDROID_TOOL_VERSION/zipalign -v 4 $APK $OUT
