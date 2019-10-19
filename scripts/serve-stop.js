const fs = require('fs');
const kill = require('tree-kill');

try {
    const serverPid = fs.readFileSync('.server.pid', {
      encoding: 'utf8'
    })
    fs.unlinkSync('.server.pid')
    kill(serverPid)
    console.log("Stopped pid " + serverPid);
} catch (error) {
    if (error.code == "ENOENT") {
        console.log("Nothing to stop");
    } else {
        throw error;
    }
}