#!/bin/sh
# 글꼴을 이 페이지에 쓰는 글자만 남겨 fonts/ 에 만든다. index.html·app.js 의 글자를 바꾸면 다시 돌리고 함께 커밋한다.
# 실행: pip install fonttools brotli && sh build.sh
set -e
mkdir -p fonts
python3 -c "
import pathlib
s=''.join(pathlib.Path(p).read_text(encoding='utf-8') for p in ['index.html','app.js'])
chars=set(s)|set(' 0123456789%·…—–“”‘’.,!?()[]')
pathlib.Path('fonts/chars.txt').write_text(''.join(sorted(chars)),encoding='utf-8')
"
for f in NanumSquareNeo-aLt NanumSquareNeo-cBd KMU80SungkokSemiSerif BookkMyungjo_Bold; do
  pyftsubset "fonts-src/$f.woff2" --text-file=fonts/chars.txt --flavor=woff2 --layout-features='*' --output-file="fonts/$f.woff2"
done
rm fonts/chars.txt
