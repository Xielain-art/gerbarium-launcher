import { exec } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import util from 'util';
import got from 'got';
import extract from 'extract-zip';

const execPromise = util.promisify(exec);

export async function checkJavaVersion(javaPath: string): Promise<string | null> {
    try {
        const { stdout, stderr } = await execPromise(`"${javaPath}" -version`);
        const output = stdout + stderr;
        // Захватываем всё содержимое внутри кавычек
        const match = output.match(/version "([^"]+)"/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

export async function findJavaInSystem(): Promise<string | null> {
    try {
        const cmd = process.platform === 'win32' ? 'where java' : 'which java';
        const { stdout } = await execPromise(cmd);
        const paths = stdout.split(/\r?\n/).filter(p => p.trim() !== '');
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
    response.on('response', (res) => {
        totalBytes = parseInt(res.headers['content-length'] || '0', 10);
    });

    response.on('downloadProgress', (progress) => {
        if (totalBytes > 0) {
            const percent = Math.round((progress.transferred / totalBytes) * 100);
            onProgress(percent);
        }
    });

    await new Promise<void>((resolve, reject) => {
        response.pipe(fileWriter)
            .on('finish', () => resolve())
            .on('error', (err) => reject(err));
    });

    await extract(zipPath, { dir: targetDir });
    await fs.remove(zipPath);

    const files = await fs.readdir(targetDir);
    const jreFolder = files.find(f => fs.statSync(path.join(targetDir, f)).isDirectory());
    if (!jreFolder) throw new Error("JRE folder not found after extraction");

    const javaBinaryPath = path.join(targetDir, jreFolder, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');

    if (process.platform !== 'win32') {
        await fs.chmod(javaBinaryPath, 0o755);
    }

    return javaBinaryPath;
}
