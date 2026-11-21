#!/bin/sh
# 사이트를 OUT(기본 _site)에 만든다. 글꼴은 이 페이지에 쓰는 글자만 남겨 줄인다.
# 실행: pip install fonttools brotli && sh build.sh _site
set -e
OUT=${1:-_site}
rm -rf "$OUT"
mkdir -p "$OUT/fonts"
cp index.html style.css app.js "$OUT/"
cp -r assets "$OUT/assets"
python3 -c "
import pathlib
s=''.join(pathlib.Path(p).read_text(encoding='utf-8') for p in ['index.html','app.js'])
chars=set(s)|set(' 0123456789%·…—–“”‘’.,!?()[]')
pathlib.Path('$OUT/fonts/chars.txt').write_text(''.join(sorted(chars)),encoding='utf-8')
"
for f in NanumSquareNeo-aLt NanumSquareNeo-cBd KMU80SungkokSemiSerif BookkMyungjo_Bold; do
  pyftsubset "fonts-src/$f.woff2" --text-file="$OUT/fonts/chars.txt" --flavor=woff2 --layout-features='*' --output-file="$OUT/fonts/$f.woff2"
done
rm "$OUT/fonts/chars.txt"
