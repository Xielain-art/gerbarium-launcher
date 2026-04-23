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

export async function downloadAndExtractJRE(url: string, targetDir: string): Promise<void> {
    console.log(`Downloading JRE from ${url} to ${targetDir}`);
    const zipPath = path.join(targetDir, 'jre.zip');
    await fs.ensureDir(targetDir);

    try {
        const response = got.stream(url);
        const fileWriter = fs.createWriteStream(zipPath);

        await new Promise<void>((resolve, reject) => {
            response.pipe(fileWriter)
                .on('finish', () => resolve())
                .on('error', (err) => {
                    console.error(`Error downloading JRE: ${err.message}`);
                    reject(err);
                });
        });

        console.log(`Extracting JRE to ${targetDir}`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(targetDir, true);
        await fs.remove(zipPath);
        console.log(`JRE extracted successfully`);
    } catch (err) {
        console.error(`Failed to download or extract JRE: ${(err as Error).message}`);
        throw err;
    }
}
