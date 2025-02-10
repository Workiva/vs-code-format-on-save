import { ChildProcess, spawn } from "child_process";
import { FormatRunner } from "./format_runner";

export class OverReactFormatRunner implements FormatRunner {
    private overReactFormatBinaryPath: string;
    private projectDirectory: string;

    private process: ChildProcess;

    constructor(binaryPath: string, projectDirectory: string) {
        this.overReactFormatBinaryPath = binaryPath;
        this.projectDirectory = projectDirectory;

        this.process = this.initializeFmtProcess();    
    }

    async format(content: string): Promise<string> {
        return new Promise((acc, rej) => {
            this.process.stdout!.on('data', (res) => {
                acc(res.toString());

                this.process = this.initializeFmtProcess();
            });
            this.process.stdin!.end(content);
        })
    }

    private initializeFmtProcess(): ChildProcess {
       return spawn(
            this.overReactFormatBinaryPath, 
            ['--stdin', '-p', './', '--detect-line-length'],
            {
                cwd: this.projectDirectory,
                stdio: ['pipe', 'pipe', 'pipe'],
            }
        )
    }
}