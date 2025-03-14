import { FormatRunner } from "./format_runner"

/** 
 * A formatter that doesn't do any formatting. 
 * 
 * Used as a fallback when over_react_format intended to be used, but
 * there was some issue with initializing it (eg: pub get hasn't been ran)
 */ 
export class NoOpFormatRunner implements FormatRunner {

    async format(content: string): Promise<string> {
        return content;
    }

    dispose() {}
}