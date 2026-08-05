import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? "TestSwap <onboarding@resend.dev>";

export async function sendLoginCodeEmail(email: string, code: string) {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `${code} — votre code de connexion TestSwap`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="margin-bottom: 8px;">Votre code de connexion</h2>
        <p style="color: #475569;">Entrez ce code sur TestSwap pour vous connecter :</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">Ce code expire dans 10 minutes. Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
