export async function sendVerificationEmail(email, token) {
    console.info(`[email] verify ${email}: ${token}`);
}
export async function sendPasswordResetEmail(email, token) {
    console.info(`[email] reset ${email}: ${token}`);
}
