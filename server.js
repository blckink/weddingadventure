const http = require('http');
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { collisions, gems } = JSON.parse(body);
        fs.writeFileSync(
          path.join(baseDir, 'data', 'collisions.js'),
          `const collisions = ${JSON.stringify(collisions)};`
        );
        fs.writeFileSync(
          path.join(baseDir, 'data', 'l_Gems.js'),
          `const l_Gems = ${JSON.stringify(gems)};`
        );
        res.writeHead(200, {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store',
        });
        res.end('Saved');
      } catch (err) {
        console.error(err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store',
        });
        res.end('Error saving');
      }
    });
  } else {
    const filePath = path.join(
      baseDir,
      req.url === '/' ? '/editor.html' : req.url
    );
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store',
        });
        res.end('Not found');
      } else {
        res.writeHead(200, { 'Cache-Control': 'no-store' });
        res.end(content);
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
