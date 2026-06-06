export async function sendVerificationEmail(email: string, token: string) {
  console.info(`[email] verify ${email}: ${token}`);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  console.info(`[email] reset ${email}: ${token}`);
}
