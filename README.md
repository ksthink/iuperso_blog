# 페르소나 아카이브 — 소개 페이지

가족과 친구, 반려동물의 기억을 RAG와 파인튜닝에 쓸 수 있게 체계적으로 모으는 수집 플랫폼(프리프로덕션 단계의 연구)의 소개 페이지입니다. 화면은 첫 사례인 **아이유 페르소나 아카이브**에서 나왔습니다.

- 페이지: https://blog.metaphr.dev/iuperso_blog/
- 제작기: https://blog.metaphr.dev/2026-11-21/iu-persona-archive-data-pipeline
- 소개: https://metaphr.dev/app.html?id=iu-archive

빌드 단계 없는 정적 페이지(HTML·CSS·JS 한 벌)이고, GitHub Pages가 `main` 브랜치 루트를 그대로 배포합니다(`.nojekyll`).

글꼴은 이 페이지에 쓰는 글자만 남겨 `fonts/`에 둡니다. `index.html`이나 `app.js`의 글자를 바꾸면 다시 만들어 함께 커밋하세요.

```sh
pip install fonttools brotli
sh build.sh                  # fonts-src/ → fonts/
python3 -m http.server       # 로컬 확인
```

화면은 목업 데이터로 찍었고, 대괄호 속 문장은 실제 발언이 아닌 예시입니다. 예시 사례는 아이유 본인 및 소속사와 관련이 없는 연구용 사례입니다.

글꼴: 나눔스퀘어네오, KMU80 성곡, 부크크 명조 — 각 배포처의 라이선스를 따릅니다.
