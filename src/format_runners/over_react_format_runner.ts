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
            let aggregate = "";
            this.process.stdout!.on('data', (res) => {
                let content = res.toString();
                aggregate += content;

                // over_react_format separates files using the File Separator character
                // when content ends with this, we know the formatted file has been
                // fully sent
                if (aggregate.endsWith('\u001E')) {
                    acc(aggregate.slice(0, aggregate.length - 1));
                }
            });
            this.process.stderr!.once('data', (res) => rej(res.toString()));
            this.process.stdin!.write(content + '\u001E');
        })
    }
}