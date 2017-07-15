#!/bin/bash
# set GH_POST_BUILD_SCRIPT on greenhouse
set -e
a=${GH_HOCKEYAPP_ANDROID_APPID?"env variable GH_HOCKEYAPP_ANDROID_APPID not defined"}
a=${GH_HOCKEYAPP_ANDROID_TOKEN?"env variable GH_HOCKEYAPP_ANDROID_TOKEN not defined"}

# 0:no, 1:allowed to install, 2:all
NOTIFY=1
# 1:no, 2:yes
ALLOW_DOWNLOAD=2
HOCKEYAPP_APPID=$GH_HOCKEYAPP_ANDROID_APPID

echo "Checking apk file"
apk_file=android-release.apk
test -f $apk_file || (echo "apk file not found: $apk_file" 1>&2 && exit 1)

echo "uploading NOTIFY=$NOTIFY, ALLOW_DOWNLOAD=$ALLOW_DOWNLOAD file=$apk_file"
curl \
    -F "notify=$NOTIFY" \
    -F "status=$ALLOW_DOWNLOAD" \
    -F "ipa=@$apk_file" \
    -H "X-HockeyAppToken: $GH_HOCKEYAPP_ANDROID_TOKEN" \
    --progress-bar \
    --verbose \
    -o /tmp/upload \
    https://rink.hockeyapp.net/api/2/apps/$HOCKEYAPP_APPID/app_versions/upload
    cat /tmp/upload | python -m json.tool
