export interface FormatRunner {
    format(content: string): Promise<string>
}