/**
 * Interface for code delivery implementations.
 * Swap this out for email, WhatsApp, etc. without changing business logic.
 */
export interface CodeSender {
  sendCode(email: string, code: string): Promise<void>;
}

/**
 * Logs the code that would be sent. For development / testing.
 */
export const createLoggingCodeSender = (): CodeSender => ({
  sendCode: async (email: string, code: string) => {
    console.log(`[CodeSender] Sending code ${code} to ${email}`);
  },
});
