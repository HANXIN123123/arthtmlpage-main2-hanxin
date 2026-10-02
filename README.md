# 디자인 한신 메인페이지 — GitHub Pages

게시 주소: https://hanxin123123.github.io/arthtmlpage-main2-hanxin/
콘솔: https://hanxin123123.github.io/arthtmlpage-console-hanxin/
Firebase 프로젝트: artmug-hanxin2

기존 디자인과 기능을 유지한 독립 복제본입니다. main 브랜치 루트를 Pages로 게시하며 Netlify 빌드·서버·Blobs는 사용하지 않습니다. 아트머그에는 artmug-embed-code.html의 iframe과 script를 함께 사용합니다.

firebase-analytics.js가 익명 인증과 직접 기록을, analytics-runtime.js와 analytics-geometry.js가 측정을 담당합니다. IP 대신 브라우저 ID를 사용하며 5초 이상 방문만 기록합니다. 브라우저·프로필·저장소 초기화에 따라 다른 방문자로 집계될 수 있습니다.

복사 버튼 클릭, 숨긴 탭을 제외한 전체 체류시간, iframe 가시 영역 기준 스크롤과 섹션 도달, 카테고리 클릭 및 작품 노출을 측정합니다. 정확한 부모 URL·위치·문의 연결에는 제공된 연동 스크립트가 필요합니다.

상세 기록과 방문자 식별값은 30일이 지나면 다음 새 방문 저장 때 정리합니다. 방문이 없으면 정리 작업도 실행되지 않습니다. 만료 인덱스만 제한 조회하며 유효한 기록 삭제와 다른 방문자의 상세 조회/수정은 보안 규칙으로 차단합니다. 누적 카운터는 날짜별 숫자만 별도로 보존합니다.

서버 없는 분석은 네트워크 차단·강제 종료에 따른 누락과 방문자 조작을 완전히 방지할 수 없습니다. 클라이언트 카운터가 인간 방문을 보증하지는 않습니다.

Firebase 설정은 공개 웹앱 설정입니다. 관리자 비밀 키나 토큰을 저장소에 넣지 마세요. database.rules.json과 firebase.json은 새 프로젝트 전용입니다. 기존 Netlify 저장소/배포/Firebase는 변경하지 않습니다. 원본 분석 내역은 복사하지 않습니다.

포트폴리오·일정·분석 기록은 빈 상태로 시작합니다. Drive 업로드는 artmug-hanxin2 / 사진 카테고리 / 2차 카테고리 아래에 저장됩니다. 아트머그 상세페이지 주소는 아직 지정하지 않았습니다.
