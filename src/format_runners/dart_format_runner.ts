import { execFileSync } from "child_process"
import { FormatRunner } from "./format_runner"
import { getDartBinaryPath } from "../utils";

export class DartFormatRunner implements FormatRunner {
    private dartBinaryPath: string

    constructor() {
       this.dartBinaryPath = getDartBinaryPath();
    }

    async format(content: string): Promise<string> {
        return new Promise((acc, rej) => {
            try {
                let res = execFileSync(
                    this.dartBinaryPath, 
                    ['format'],
                    { input: content }
                )
    
                acc(res.toString());
            } catch (error) {
                if (error instanceof Error) {
                    rej(error.message);
                } else {
                    rej(`Unexpected error: ${error}`);
                }
            }
        })
    }

    dispose() {}
}