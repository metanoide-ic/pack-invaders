/* Gera o build em arquivo único (standalone + artifact) com tudo inline.
   Uso: node tools/bundle.js [saidaArtifact.html]  (a partir de humanocracy/) */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const SCRIPTS = ['three.min.js', 'data.js', 'i18n.js', 'faces.js', 'game.js', 'photochar.js', 'house.js', 'house3d.js'];
const css = R('style.css').replace("@import url('data:,');\n", '');
let body = R('index.html').split('<body>')[1].split('</body>')[0];
SCRIPTS.forEach(s => { body = body.replace(`<script src="${s}"></script>`, ''); });
body = body.trim();
SCRIPTS.forEach(s => {
  if (R(s).includes('</scr' + 'ipt>')) throw new Error('script contém </script>: ' + s);
});
const scripts = SCRIPTS.map(s => `<script>\n${R(s)}\n</script>`).join('\n');
const head = `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>HUMANOCRACY — Posto de Triagem 7</title>\n<style>\n${css}\n</style>`;

fs.writeFileSync(path.join(ROOT, 'humanocracy-standalone.html'),
  `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n${head}\n</head>\n<body>\n${body}\n${scripts}\n</body>\n</html>\n`);

const artifactOut = process.argv[2];
if (artifactOut) fs.writeFileSync(artifactOut, `<title>HUMANOCRACY — Posto de Triagem 7</title>\n<style>\n${css}\n</style>\n${body}\n${scripts}\n`);

const kb = fs.statSync(path.join(ROOT, 'humanocracy-standalone.html')).size / 1024 | 0;
console.log(`bundle ok — standalone ${kb}KB${artifactOut ? ', artifact ' + artifactOut : ''}`);
