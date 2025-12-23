const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

// Check if we are running from npm run dev
const isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'DiyetKent',
    frame: false, // Remove native window frame
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Hide until ready to prevent flashing
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1a1a2e', // Match theme
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-restored');
  });
}

// IPC Handlers for Custom TitleBar
ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow.close();
});


function startPythonBackend() {
  // Path to the python executable and api script
  // In dev: we assume python is in path and we run backend/api.py
  // In prod: we would bundle the executable
  const scriptPath = path.join(__dirname, '../../backend/api.py');
  
  console.log('Starting Python backend from:', scriptPath);

  pythonProcess = spawn('python', [scriptPath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
}

app.on('ready', () => {
  startPythonBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Kill Python process when app quits
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
