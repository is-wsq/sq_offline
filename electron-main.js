const { app, BrowserWindow, ipcMain, dialog, screen, session, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process')

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
        // 配置微信登录所需的跨域和安全策略
        configureWechatLoginSecurity();

        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            frame: true,
            show: false,
            icon: path.join(__dirname, 'public/logo.ico'),
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'), // 如果需要
                contextIsolation: true,
                enableRemoteModule: false,
                webSecurity: false, // 临时关闭web安全以解决微信登录跨域问题
            }
        });

        // 监听微信登录请求
        ipcMain.on('open-weixin-login', (event, loginUrl) => {
            openWechatLoginWindow(loginUrl);
        });

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

            const { execSync } = require('child_process');
            let batPath;

            try {
                // 尝试访问D盘根目录
                execSync('dir D:\\', { stdio: 'ignore' });
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

// 配置微信登录的安全策略和跨域设置
function configureWechatLoginSecurity() {
    // 允许微信相关域名的跨域请求
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        // 微信登录相关域名
        const wechatDomains = [
            'https://open.weixin.qq.com',
            'https://api.weixin.qq.com',
            'https://localhost.weixin.qq.com'
        ];

        const isWechatDomain = wechatDomains.some(domain =>
            details.url.startsWith(domain)
        );

        if (isWechatDomain) {
            details.requestHeaders['Origin'] = 'https://open.weixin.qq.com';
            details.requestHeaders['Referer'] = 'https://open.weixin.qq.com';
        }

        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    // 处理响应头，允许跨域
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Access-Control-Allow-Origin': ['*'],
                'Access-Control-Allow-Methods': ['GET, POST, OPTIONS'],
                'Access-Control-Allow-Headers': ['Content-Type']
            }
        });
    });

    // 允许必要的权限请求
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        // 允许与微信登录相关的权限
        if (['webNavigation', 'webRequest', 'media', 'notifications'].includes(permission)) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

// 创建微信登录窗口
function openWechatLoginWindow(loginUrl) {
    const loginWindow = new BrowserWindow({
        width: 400,
        height: 500,
        title: '微信登录',
        modal: true,
        parent: mainWindow,
        webPreferences: {
            contextIsolation: true,
            webSecurity: false,
            nodeIntegration: false
        }
    });

    // 加载微信登录链接
    loginWindow.loadURL(loginUrl);

    // 监听窗口导航事件，获取回调信息
    loginWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        // 这里替换为你的微信登录回调域名或本地回调地址
        if (navigationUrl.includes('your-callback-domain.com') ||
            navigationUrl.includes('localhost') ||
            navigationUrl.includes('127.0.0.1')) {

            event.preventDefault();

            // 解析回调参数
            const urlParams = new URL(navigationUrl).searchParams;
            const code = urlParams.get('code');
            const state = urlParams.get('state');

            // 将登录结果发送给主窗口
            if (mainWindow && code) {
                mainWindow.webContents.send('weixin-login-success', { code, state });
            }

            // 关闭登录窗口
            loginWindow.close();
        }
    });

    // 监听页面内跳转（如果微信登录使用iframe或页面内跳转）
    loginWindow.webContents.on('did-navigate-in-page', (event, url) => {
        if (url.includes('your-callback-domain.com') ||
            url.includes('localhost') ||
            url.includes('127.0.0.1')) {

            const urlParams = new URL(url).searchParams;
            const code = urlParams.get('code');
            const state = urlParams.get('state');

            if (mainWindow && code) {
                mainWindow.webContents.send('weixin-login-success', { code, state });
                loginWindow.close();
            }
        }
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
            fs.mkdirSync(targetDirectory, { recursive: true });
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

        return { success: true, path: targetPath };
    } catch (error) {
        console.error('保存文件失败：', error);
        return { success: false, error: error.message };
    }
});