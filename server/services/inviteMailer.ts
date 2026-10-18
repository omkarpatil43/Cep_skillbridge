/**
 * Development-safe delivery: returns the link when SMTP is unconfigured.
 * Configure SMTP_* and replace this adapter with a provider transport for production delivery.
 */
export const deliverClubAdminInvite = async (email: string, inviteUrl: string) => {
  if (!process.env.SMTP_HOST) {
    console.log(`[DEV INVITE] ${email}: ${inviteUrl}`);
    return { delivered: false, inviteUrl };
  }
  // Keeping SMTP credentials out of application code. A transport/provider can be configured here.
  console.warn('SMTP is configured but no provider adapter is installed; returning invite link safely.');
  return { delivered: false, inviteUrl };
};
