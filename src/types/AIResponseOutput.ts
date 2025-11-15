/**
 * Unified return type for any AI provider call.
 */
export interface AIResponse<TOutput = any> {
    /** The main output of the call, e.g., text, embeddings, image URL, etc. */
    output: TOutput;

    /** The raw response object from the provider, useful for debugging. */
    rawResponse?: any;

    /** Metadata about the request, e.g., model used, request ID, timestamp, tokens used */
    metadata?: {
        model?: string;
        requestId?: string;
        timestamp?: number;
        tokensUsed?: number;
        [key: string]: any;
    };

    /** Any error information returned by the provider */
    error?: Error | string;
}