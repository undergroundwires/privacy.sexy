export interface ExtractionResult {
  readonly appExecutablePath: string;
  readonly cleanup?: () => Promise<void>;
}
