const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const fs = require('fs');

const child = spawn('node', [
  'node_modules/tiddlywiki/tiddlywiki.js',
  '++./plugin',
  'build',
  '--verbose',
  '--listen'
], {
  detached: true,
  stdio: 'ignore'
})
child.unref();

if (typeof child.pid !== 'undefined') {
  fs.writeFileSync('.server.pid', child.pid, {
    encoding: 'utf8'
  })
}

console.log("Started pid " + child.pid);