export const notExpired = (expiresAt: Date): boolean => {
    const dateNow = new Date();
    const dateExpiresAt = new Date(expiresAt);
    return dateNow.getTime() < dateExpiresAt.getTime();
}