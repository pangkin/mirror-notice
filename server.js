const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (모든 출처 허용)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 정적 파일 제공 (CSS, 이미지 등)
app.use(express.static(path.join(__dirname, 'public')));

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

// 단일 공지사항을 읽는 함수
async function getNoticeByFilename(filename) {
  const filePath = path.join(__dirname, 'notices', filename);
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);

  return {
    filename,
    title: data.title || '제목 없음',
    date: data.date || new Date(),
    author: data.author || '관리자',
    priority: data.priority || 'normal',
    status: data.status || 'completed',
    content: marked(markdown),
    rawContent: markdown,
  };
}

// API 엔드포인트 - 공지사항 목록
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await getNotices();
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: '공지사항을 불러오는데 실패했습니다.' });
  }
});

// API 엔드포인트 - 단일 공지사항
app.get('/api/notices/:filename', async (req, res) => {
  try {
    const notice = await getNoticeByFilename(req.params.filename);
    res.json(notice);
  } catch (error) {
    res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
  }
});

// HTML 페이지 렌더링
app.get('/', async (req, res) => {
  try {
    const htmlPath = path.join(__dirname, 'notice.html');
    const html = await fs.readFile(htmlPath, 'utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).send('페이지를 불러오는데 실패했습니다.');
  }
});

// main-ko.html 페이지 제공
app.get('/main', async (req, res) => {
  try {
    const htmlPath = path.join(__dirname, 'main-ko.html');
    const html = await fs.readFile(htmlPath, 'utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).send('페이지를 불러오는데 실패했습니다.');
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`공지사항 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
