# 아이유 페르소나 아카이브 — 소개 페이지

페르소나 챗봇에 넣을 자료를 모으고 다듬는 1인용 수집 도구(비공개 운영)의 소개 페이지입니다.

- 페이지: https://ksthink.github.io/iuperso_blog/
- 제작기: https://blog.metaphr.dev/2026-11-21/iu-persona-archive-data-pipeline
- 소개: https://metaphr.dev/app.html?id=iu-archive

빌드 단계 없는 정적 페이지(HTML·CSS·JS 한 벌)입니다. `main`에 푸시하면 GitHub Actions가 글꼴을 이 페이지에 쓰는 글자만 남겨 줄이고 GitHub Pages에 배포합니다.

```sh
pip install fonttools brotli
sh build.sh _site            # _site/ 에 결과물
python3 -m http.server -d _site
```

화면은 목업 데이터로 찍었고, 대괄호 속 문장은 실제 발언이 아닌 예시입니다. 아이유 본인 및 소속사와 관련이 없는 개인 프로젝트입니다.

글꼴: 나눔스퀘어네오, KMU80 성곡, 부크크 명조 — 각 배포처의 라이선스를 따릅니다.
