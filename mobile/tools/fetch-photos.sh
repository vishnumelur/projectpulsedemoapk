#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/photos
get() { curl -fsSL "https://images.unsplash.com/photo-$2?w=$3&h=$4&fit=crop&crop=faces&q=80" -o "assets/photos/$1.jpg"; }
getw() { curl -fsSL "https://images.unsplash.com/photo-$2?w=$3&q=80" -o "assets/photos/$1.jpg"; }
get sara   1494790108377-be9c29b29330 400 400
get omar   1500648767791-00dcc994a43e 900 980
get lina   1573496359142-b8d87734a5a2 600 680
get rashid 1560250097-0b93528c311a 600 680
get maya   1544005313-94ddf0286df2 600 680
get karim  1507003211169-0a1dd7228f2d 600 680
get nadia  1438761681033-6461ffad8d80 600 680
getw site1    1541888946425-d81bb19240f5 900
getw site2    1504307651254-35680f356dfd 600
getw drawings 1503387762-592deb58ef4e 600
getw port1    1600596542815-ffad4c1539a9 600
getw port2    1512917774080-9991f1c4c750 600
getw port3    1565008447742-97f6f38c985c 600
echo "photos: $(ls assets/photos | wc -l)"
