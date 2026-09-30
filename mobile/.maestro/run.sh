#!/usr/bin/env bash
# Project Pulse QA runner (client Task 7). Runs each Maestro flow on the QA emulator from a fresh demo state.
#   usage: .maestro/run.sh [flow.yaml ...]          (default: every top-level flow, in name order)
#   env:   DEVICE (default emulator-5556), PORT (Metro, default 8190), OUT (default ../docs/qa/runs/<timestamp>)
# Fresh state = force-stop Expo Go and delete only this experience's AsyncStorage (needs `adb root`, fine on the
# google_apis emulator image). Expo Go itself keeps its "dev menu seen" flag, so no intro sheet covers the app.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE/.."
DEVICE=${DEVICE:-emulator-5556}; PORT=${PORT:-8190}
export JAVA_HOME=${JAVA_HOME:-$HOME/Android/jdk} PATH=$HOME/.maestro/bin:$HOME/Android/jdk/bin:$HOME/Android/Sdk/platform-tools:$PATH
export MAESTRO_CLI_NO_ANALYTICS=1 MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true
IP=$(hostname -I | awk '{print $1}'); URL="exp://$IP:$PORT"
STAMP=$(date +%Y%m%d-%H%M%S); OUT=${OUT:-$PWD/../docs/qa/runs/$STAMP}; mkdir -p "$OUT"
ADB="adb -s $DEVICE"
reset_app() {
  $ADB root >/dev/null 2>&1; $ADB wait-for-device
  $ADB shell am force-stop host.exp.exponent
  $ADB shell 'rm -f /data/data/host.exp.exponent/databases/RKStorage-scoped-experience-*'
}
FLOWS=("$@"); [ ${#FLOWS[@]} -eq 0 ] && FLOWS=($(ls .maestro/[0-9]*.yaml | sort))
echo "flow,result,seconds" > "$OUT/summary.csv"
for f in "${FLOWS[@]}"; do
  name=$(basename "$f" .yaml); echo "=== $name"
  for attempt in 1 2; do
    reset_app; t0=$(date +%s); dir="$OUT/$name"; [ $attempt -eq 2 ] && dir="$OUT/$name-retry"
    # a hard cap per flow: Maestro's hierarchy call can hang forever on screens that never idle (seen once on Home)
    timeout ${FLOW_TIMEOUT:-2700} maestro --device "$DEVICE" test -e APP_URL="$URL" -e LAUNCH_PATH="/--/?qa=1" -e CLEAR=false \
      --test-output-dir "$dir" --debug-output "$dir/debug" --format junit --output "$dir/junit.xml" "$f" > "$dir.log" 2>&1
    rc=$?; res=$([ $rc -eq 0 ] && echo PASS || echo FAIL)
    # retry once only for driver hangs (timeout, cancelled hierarchy); a real assertion failure is reported as is
    if [ $rc -ne 0 ] && { [ $rc -eq 124 ] || grep -qE "viewHierarchy' failed|UNAVAILABLE|DEADLINE_EXCEEDED" "$dir.log" "$dir"/*/*/logs/maestro.log 2>/dev/null; }; then
      res=INFRA; echo "    driver hang (attempt $attempt)"; adb -s "$DEVICE" shell am force-stop dev.mobile.maestro >/dev/null 2>&1; continue
    fi
    break
  done
  echo "$name,$res,$(( $(date +%s) - t0 ))" >> "$OUT/summary.csv"; echo "    $res"
  # soft checks (optional: true) that did not hold: listed for results.md
  grep -hoE "onCommandFinished: .* WARNED$" "$dir"/*/*/logs/maestro.log 2>/dev/null | sed -E "s/onCommandFinished: /$name: /" >> "$OUT/warned.txt"
done
echo "results: $OUT"; column -t -s, "$OUT/summary.csv"
