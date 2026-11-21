#!/usr/bin/env bash
# 单词保卫战 TV 版一键打包脚本（无需 Gradle / 网络）。
# 依赖：JDK、Android SDK platform android-19、build-tools 34.0.0、Python 3。
# assets/tv 内容由 tools/transform.js 从原项目转译生成；如需重新转译，
# 先在 tv/tools 执行 npm install，再执行 node tools/transform.js。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SDK="${ANDROID_HOME:-/c/Users/84578/AppData/Local/Android/Sdk}"
BT="${SDK}/build-tools/34.0.0"
JAR="${SDK}/platforms/android-19/android.jar"
BUILD="${ROOT}/build"
APK="${ROOT}/word-defense-tv.apk"

[ -f "$JAR" ] || { echo "缺少 Android 19 平台：$JAR"; exit 1; }
[ -f "$BT/aapt2.exe" ] || { echo "缺少 build-tools 34.0.0：$BT"; exit 1; }

rm -rf "$BUILD"
mkdir -p "$BUILD/classes" "$BUILD/dexout"

# 1. 资源
"$BT/aapt2.exe" compile --dir "$ROOT/android/res" -o "$BUILD/res.zip"
"$BT/aapt2.exe" link -o "$BUILD/base.apk" -I "$JAR" \
  --manifest "$ROOT/android/AndroidManifest.xml" \
  --min-sdk-version 19 --target-sdk-version 28 \
  --version-code 1 --version-name 1.0 "$BUILD/res.zip"

# 2. Java：按 Java 8 字节码编译，D8 会转成 Dalvik 可执行的 dex
javac -source 8 -target 8 -encoding UTF-8 -Xlint:-options \
  -cp "$JAR" -d "$BUILD/classes" \
  "$ROOT/android/src/com/niannian/worddefense/TvActivity.java"

python - "$BUILD" > "$BUILD/classes.txt" <<'PY'
# Java 在 Windows 下不认识 Git Bash 的 /c/... 路径，写成 C:/... 形式
import os, sys
base = os.path.join(sys.argv[1], 'classes')
for dirpath, _, files in os.walk(base):
    for name in files:
        if name.endswith('.class'):
            print(os.path.join(dirpath, name).replace('\\', '/'))
PY
java -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 \
  --lib "$JAR" --min-api 19 --output "$BUILD/dexout" @"$BUILD/classes.txt"

# 3. 合并 dex 与 assets
python - "$BUILD" "$ROOT" <<'PY'
import os, sys, zipfile
build, root = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(os.path.join(build, 'base.apk')) as zin, \
     zipfile.ZipFile(os.path.join(build, 'unsigned.apk'), 'w', zipfile.ZIP_DEFLATED) as zout:
    for info in zin.infolist():
        if info.filename == 'classes.dex':
            continue
        zout.writestr(info, zin.read(info.filename))
    zout.write(os.path.join(build, 'dexout', 'classes.dex'), 'classes.dex')
    asset_root = os.path.join(root, 'assets')
    for dirpath, _, names in os.walk(asset_root):
        for name in names:
            full = os.path.join(dirpath, name)
            arc = 'assets/' + os.path.relpath(full, asset_root).replace(os.sep, '/')
            zout.write(full, arc)
print('assets merged')
PY

# 4. 对齐 + 签名（使用固定调试密钥，便于重复构建覆盖安装）
"$BT/zipalign.exe" -f 4 "$BUILD/unsigned.apk" "$BUILD/aligned.apk"
if [ ! -f "$BUILD/debug.keystore" ]; then
  keytool -genkeypair -keystore "$BUILD/debug.keystore" -storepass android -keypass android \
    -alias androiddebugkey -dname "CN=Android Debug,O=Word Defense TV,C=CN" \
    -keyalg RSA -keysize 2048 -validity 10000 >/dev/null 2>&1
fi
"$BT/apksigner.bat" sign --ks "$BUILD/debug.keystore" --ks-pass pass:android \
  --key-pass pass:android --out "$APK" "$BUILD/aligned.apk"

echo "APK 已生成：$APK"
ls -lh "$APK"
