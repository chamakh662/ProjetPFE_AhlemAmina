const nodemailer = require('nodemailer');

/**
 * Envoie l’email de réinitialisation. Nécessite SMTP_* dans .env.
 */
async function sendResetPasswordEmail(to, resetUrl) {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        const err = new Error('SMTP_NON_CONFIGURE');
        err.code = 'SMTP_NON_CONFIGURE';
        throw err;
    }

    const transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
    });

    const from = process.env.SMTP_FROM || user;

    await transporter.sendMail({
        from,
        to,
        subject: 'Réinitialisation de votre mot de passe — GreenCheck',
        text: `Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien dans votre navigateur :\n${resetUrl}\n\nCe lien expire dans 1 heure.\n\nSi vous n’avez pas demandé cette réinitialisation, ignorez cet email.\n`,
        html: `<p>Bonjour,</p>
<p>Pour choisir un nouveau mot de passe, cliquez sur le lien ci-dessous :</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>Ce lien expire dans <strong>1 heure</strong>.</p>
<p>Si vous n’avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>`,
    });
}

module.exports = { sendResetPasswordEmail };
