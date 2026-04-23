import { exec } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import util from 'util';
import got from 'got';
import AdmZip from 'adm-zip';

const execPromise = util.promisify(exec);

export async function checkJavaVersion(javaPath: string): Promise<string | null> {
    try {
        const { stdout, stderr } = await execPromise(`"${javaPath}" -version`);
        const output = stdout + stderr;
        const match = output.match(/version "([\d\.]+)"/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

export async function findJavaInSystem(): Promise<string | null> {
    try {
        const { stdout } = await execPromise('where java');
        const paths = stdout.split('\r\n').filter(p => p.trim() !== '');
        return paths.length > 0 ? paths[0] : null;
    } catch (error) {
        return null;
    }
}

export async function downloadAndExtractJRE(
    url: string, 
    targetDir: string, 
    onProgress: (percent: number) => void
): Promise<string> {
    const zipPath = path.join(targetDir, 'jre.zip');
    await fs.ensureDir(targetDir);

    const response = got.stream(url);
    const fileWriter = fs.createWriteStream(zipPath);

    let totalBytes = 0;
    let downloadedBytes = 0;

    response.on('response', (res) => {
        totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        console.log(`Download started. Total size: ${totalBytes} bytes`);
    });

    response.on('downloadProgress', (progress) => {
        downloadedBytes = progress.transferred;
        console.log(`Downloaded: ${downloadedBytes} bytes`);
        if (totalBytes > 0) {
            const percent = Math.round((downloadedBytes / totalBytes) * 100);
            onProgress(percent);
        }
    });

    await new Promise<void>((resolve, reject) => {
        response.pipe(fileWriter)
            .on('finish', () => resolve())
            .on('error', (err) => reject(err));
    });

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetDir, true);
    await fs.remove(zipPath);

    // Поиск папки JRE после распаковки
    const files = await fs.readdir(targetDir);
    const jreFolder = files.find(f => fs.statSync(path.join(targetDir, f)).isDirectory());
    if (!jreFolder) throw new Error("JRE folder not found after extraction");
    
    return path.join(targetDir, jreFolder, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
}
