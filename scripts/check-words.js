import fs from 'fs';

function stripHtml(html) {
  // Strip HTML tags and escaped newlines
  const text = html.replace(/\\n/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text;
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function analyzeArticlesInFile(filePath) {
  console.log(`\n========================================`);
  console.log(`FILE: ${filePath}`);
  console.log(`========================================`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Match content properties with backtick OR double-quote OR single-quote
  // e.g. "content": `...` or content: `...` or "content": "..."
  const regex = /["']?content["']?\s*:\s*([`'"])((?:[^\\]|\\.)*?)\1/gs;
  let match;
  let count = 0;
  let passCount = 0;

  while ((match = regex.exec(content)) !== null) {
    count++;
    const rawBody = match[2];
    const plainText = stripHtml(rawBody);
    const wc = countWords(plainText);
    const pass = wc >= 800;
    if (pass) passCount++;

    // Try to find id nearby before this
    const snippet = content.slice(Math.max(0, match.index - 400), match.index);
    const idMatch = snippet.match(/["']?id["']?\s*:\s*["']([^"']+)["']/);
    const id = idMatch ? idMatch[1] : `Article #${count}`;

    console.log(`[${pass ? 'PASS' : 'FAIL'}] #${count} | ID: ${id} | Words: ${wc}`);
  }

  console.log(`\nSummary for ${filePath}: ${passCount}/${count} passed 800+ words.`);
  return { total: count, passed: passCount };
}

analyzeArticlesInFile('src/components/themes/WorldNewsPage.tsx');
analyzeArticlesInFile('src/components/themes/EntertainmentPage.tsx');
analyzeArticlesInFile('src/data/articles.ts');
analyzeArticlesInFile('server.ts');
