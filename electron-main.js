const {app, BrowserWindow, ipcMain,dialog,ipcRenderer, screen  } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn  } = require('child_process')

let mainWindow;
let isMainInstance = false; // 新增标志位，标识是否为主实例

// 确保应用只能打开一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    // 如果获取锁失败，说明已经有实例在运行，则直接退出，不执行任何窗口操作
    app.quit();
} else {
    // 设置当前实例为主实例
    isMainInstance = true;

    // 当第二个实例启动时，聚焦到第一个实例的窗口
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // 当有人试图运行第二个实例时，我们将聚焦到主窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            mainWindow.show();
        }
    });

    app.on('ready', () => {
        const primaryDisplay = screen.getPrimaryDisplay();
        const {width, height} = primaryDisplay.workAreaSize;
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
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
            if (!isMainInstance) {
                // 如果不是主实例，不执行任何特殊操作，让窗口正常关闭
                return;
            }

            e.preventDefault();

            const {execSync} = require('child_process');
            let batPath;

            try {
                // 尝试访问D盘根目录
                execSync('dir D:\\', {stdio: 'ignore'});
                batPath = "D:\\offline\\stop_backend.bat";
            } catch (error) {
                batPath = "C:\\offline\\stop_backend.bat";
            }

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
}

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

ipcMain.handle('download-image', async (event, imageUrl) => {
    try {
        // 让用户选择保存位置
        const { filePath } = await dialog.showSaveDialog({
            title: '保存图片',
            defaultPath: path.join(app.getPath('downloads'), 'image.png'),
            filters: [
                { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'] },
                { name: '所有文件', extensions: ['*'] }
            ]
        })

        // 如果用户取消选择，返回取消信息
        if (!filePath) {
            return { success: false, error: '用户取消下载' }
        }
        console.log('开始下载图片:', imageUrl, '->', filePath)
        // 下载并保存图片
        await downloadFile(imageUrl, filePath)

        return { success: true, path: filePath }
    } catch (error) {
        console.error('下载图片时出错:', error)
        return { success: false, error: error.message }
    }
});

function downloadFile(url, filePath) {
    console.warn('开始下载文件:', url, '->', filePath)
    return new Promise((resolve, reject) => {
        const request = http.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`请求失败，状态码: ${response.statusCode}`))
                return
            }

            const fileStream = fs.createWriteStream(filePath)

            response.pipe(fileStream)

            fileStream.on('finish', () => {
                fileStream.close(resolve)
            })

            fileStream.on('error', (error) => {
                fs.unlink(filePath, () => {})
                reject(new Error(`写入文件失败: ${error.message}`))
            })
        })

        request.on('error', (error) => {
            reject(new Error(`请求URL失败: ${error.message}`))
        })

        request.setTimeout(30000, () => {
            request.abort()
            reject(new Error('请求超时'))
        })
    })
}
