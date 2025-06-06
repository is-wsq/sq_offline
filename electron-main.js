const {app, BrowserWindow, ipcMain,dialog,ipcRenderer, screen  } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn  } = require('child_process')

let mainWindow;

app.on('ready', () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        // x: 0,
        // y: 0,
        frame: true,
        show: false,
        icon: path.join(__dirname, 'public/favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // 如果需要
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    // mainWindow.removeMenu();

    // 加载 Vue 项目生成的 HTML 文件
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    mainWindow.loadFile(indexPath);

    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.maximize()
        mainWindow.show()
    });

    mainWindow.on('close', (e) => {
        // mainWindow = null;
        e.preventDefault();

        const batPath = "D:\\offline\\stop_backend.bat";
        const batProcess = spawn('cmd.exe', ['/c', 'start', '', batPath]);

        batProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        batProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            mainWindow.removeAllListeners('close');
            mainWindow.close();
        });

        batProcess.on('close', (code) => {
            console.log(`子进程退出，代码：${code}`);
            mainWindow.removeAllListeners('close');
            mainWindow.close();
        });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (!result.canceled) {
        return result.filePaths[0]
    }
})

ipcMain.on('download-video', (event, { url, path: savePath, fileName }) => {
    // const fileName = path.basename(url)
    const fullPath = path.join(savePath, fileName + '.mp4')

    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true })
    }

    const file = fs.createWriteStream(fullPath)

    http.get(url, (response) => {
        response.pipe(file)
        file.on('finish', () => {
            file.close()
            console.log('✅ 视频已保存到: ' + fullPath)
        })
    }).on('error', (err) => {
        console.error('❌ 下载失败:', err.message)
    })
})

ipcMain.handle('save-file', async (event, fileInfo) => {
    try {
        const targetDirectory = path.join('C:\\Program Files (x86)\\SingAI', 'files')

        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory, {recursive: true});
        }

        if (fileInfo.clear) {
            // 清空目标文件夹内的所有文件
            const files = fs.readdirSync(targetDirectory);
            for (const file of files) {
                const filePath = path.join(targetDirectory, file);
                fs.unlinkSync(filePath);
            }
        }

        const targetPath = path.join(targetDirectory, fileInfo.name);

        const buffer = Buffer.from(fileInfo.buffer);
        fs.writeFileSync(targetPath, buffer);

        return {success: true, path: targetPath};
    } catch (error) {
        console.error('保存文件失败：', error);
        return {success: false, error: error.message};
    }
});
