const { src, dest, parallel } = require('gulp');

function html() {
  return src('index.html').pipe(dest('dist/'));
}
function js() {
  return src('script.js').pipe(dest('dist/'));
}

exports.js = js;
exports.html = html;
exports.default = parallel(html, js);
