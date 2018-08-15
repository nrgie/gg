const {app, BrowserWindow} = require('electron')
let mainWindow

platform = process.platform;
if (platform === 'win32') {
   coreserverProcess = require('child_process').spawn('cmd.exe', ['/c', 'ggserver.bat'],{cwd: app.getAppPath() + '/ggserver/bin'});
} else {
   coreserverProcess = require('child_process').spawn(app.getAppPath() + '/ggserver/bin/ggserver');
}

let sUrl = 'http://localhost:9999';

const openWindow = function () {
    mainWindow = new BrowserWindow({ title: 'GG',width: 1280,height: 800 });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
	mainWindow = null;
    });

    mainWindow.on('close', function (e) {
	if (coreserverProcess) {
	    e.preventDefault();
	    const kill = require('tree-kill');
	    kill(coreserverProcess.pid, 'SIGTERM', function () {
		console.log('Core Server process killed');
		coreserverProcess = null;
		mainWindow.close();
	    });
	}
    });
};

const startUp = function () {
   const requestPromise = require('minimal-request-promise');
   requestPromise.get(sUrl).then(function(response) {
       console.log('Server started!');
       openWindow();
   }, function (response) {
       console.log('Waiting for the server start...');
       setTimeout(function () {
           startUp();
       }, 200);
   });
};

startUp();