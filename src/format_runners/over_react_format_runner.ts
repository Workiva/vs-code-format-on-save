import { ChildProcess, spawn } from "child_process";
import { FormatRunner } from "./format_runner";
import { getDartBinaryPath } from "../utils";

export class OverReactFormatRunner implements FormatRunner {
    private projectDirectory: string;

    private process: ChildProcess;

    constructor(projectDirectory: string) {
        this.projectDirectory = projectDirectory;
        this.process = spawn(
            getDartBinaryPath(),
            ['run', 'over_react_format', '--stdin', '-p', './', '--detect-line-length'],
            {
                cwd: this.projectDirectory,
                stdio: ['pipe', 'pipe', 'pipe'],
            }
        );
    }

    dispose() {
        this.process.kill();
    }

    async format(content: string): Promise<string> {
        return new Promise((acc, rej) => {
            this.process.stdout!.once('data', (res) => acc(res.toString()));
            this.process.stdin!.write(content);
        })
    }
}