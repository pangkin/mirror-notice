const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// 마크다운 파일을 읽어서 파싱하는 함수
async function getNotices() {
  const noticesDir = path.join(__dirname, 'notices');
  const files = await fs.readdir(noticesDir);

  const notices = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(noticesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: markdown } = matter(content);

        return {
          filename: file,
          title: data.title || '제목 없음',
          date: data.date || new Date(),
          author: data.author || '관리자',
          priority: data.priority || 'normal',
          status: data.status || 'completed',
          content: marked(markdown),
          rawContent: markdown,
        };
      })
  );

  // 날짜 기준 내림차순 정렬 (최신순)
  notices.sort((a, b) => new Date(b.date) - new Date(a.date));

  return notices;
}

// HTML 템플릿 생성
async function generateHTML(notices) {
  const template = await fs.readFile(
    path.join(__dirname, 'notice.html'),
    'utf-8'
  );

  const priorityLabels = {
    high: '중요',
    normal: '일반',
    low: '참고',
  };

  const priorityBadgeClass = {
    high: 'priority-badge-high',
    normal: 'priority-badge-normal',
    low: 'priority-badge-low',
  };

  const statusLabels = {
    scheduled: '예정',
    ongoing: '진행 중',
    completed: '완료',
  };

  const statusBadgeClass = {
    scheduled: 'status-badge-scheduled',
    ongoing: 'status-badge-ongoing',
    completed: 'status-badge-completed',
  };

  let noticesHTML = '';

  if (notices.length === 0) {
    noticesHTML = `
      <div class="text-center py-12">
        <span class="text-gray-400">등록된 공지사항이 없습니다.</span>
      </div>
    `;
  } else {
    noticesHTML = notices
      .map((notice) => {
        const date = new Date(notice.date);
        const formattedDate = date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return `
          <div class="notice-card mb-8 rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div class="p-6 sm:p-8">
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2 flex-wrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      priorityBadgeClass[notice.priority]
                    }">
                      ${priorityLabels[notice.priority]}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      statusBadgeClass[notice.status]
                    }">
                      ${statusLabels[notice.status]}
                    </span>
                    <span class="text-sm text-gray-500">${formattedDate}</span>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">${
                    notice.title
                  }</h2>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span class="material-icons" style="font-size: 16px;">person</span>
                    <span>${notice.author}</span>
                  </div>
                </div>
              </div>
              <div class="notice-content prose max-w-none">
                ${notice.content}
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // 템플릿에서 JavaScript 부분을 제거하고 정적 HTML로 교체
  const staticHTML = template
    .replace(
      /<div id="notices-container">[\s\S]*?<\/div>/,
      `<div id="notices-container">${noticesHTML}</div>`
    )
    .replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, `</body>`);

  return staticHTML;
}

// 정적 페이지 빌드
async function buildStaticPage() {
  try {
    console.log('📢 공지사항 정적 페이지 빌드 시작...');

    // notices 읽기
    const notices = await getNotices();
    console.log(`✅ ${notices.length}개의 공지사항을 찾았습니다.`);

    // HTML 생성
    const html = await generateHTML(notices);

    // dist 디렉토리 생성
    const distDir = path.join(__dirname, 'dist');
    await fs.mkdir(distDir, { recursive: true });

    // index.html 저장
    await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf-8');
    console.log('✅ dist/index.html 생성 완료');

    // CSS 파일 복사
    try {
      const cssSource = path.join(__dirname, 'public', 'tailwind.css');
      const cssTarget = path.join(distDir, 'tailwind.css');
      await fs.copyFile(cssSource, cssTarget);
      console.log('✅ dist/tailwind.css 복사 완료');
    } catch (error) {
      console.warn(
        '⚠️  CSS 파일 복사 실패 (public/tailwind.css가 없을 수 있습니다)'
      );
    }

    // API JSON 파일도 생성
    const apiData = notices.map((notice) => ({
      filename: notice.filename,
      title: notice.title,
      date: notice.date,
      author: notice.author,
      priority: notice.priority,
      status: notice.status,
      content: notice.content,
    }));

    await fs.writeFile(
      path.join(distDir, 'notices.json'),
      JSON.stringify(apiData, null, 2),
      'utf-8'
    );
    console.log('✅ dist/notices.json 생성 완료');

    console.log('🎉 빌드 완료!');
  } catch (error) {
    console.error('❌ 빌드 실패:', error);
    process.exit(1);
  }
}

// 실행
buildStaticPage();
