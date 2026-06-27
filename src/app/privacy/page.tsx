import type { Metadata } from "next";
import LegalShell, { LegalH2 } from "@/components/LegalShell";

/*
 * ⚠️ REVIEW BEFORE LAUNCH (with legal counsel):
 *   - Confirm the operating legal entity name (trade name "Mapped") and, if
 *     required in your market, a mailing address. Owner is based in Medina, TX.
 *   - Confirm the children's minimum age for your markets (13 US / 16 EU).
 *   - Verify each named sub-processor is current.
 * This is a solid, app-specific starting draft — not a substitute for legal advice.
 */

export const metadata: Metadata = {
  title: "Privacy Policy — Mapped",
  description: "How Mapped collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 19, 2026">
      <p>
        This Privacy Policy explains how Mapped (&ldquo;Mapped,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects,
        uses, and protects your information when you use our astrology app and website (the &ldquo;Service&rdquo;).
        By using the Service, you agree to this Policy.
      </p>

      <LegalH2>Information we collect</LegalH2>
      <p>
        <strong>Account information.</strong> Your email address, a password (stored only in hashed form by our
        authentication provider), and your name or display name. If you sign in with Google, we receive basic
        profile information from that provider.
      </p>
      <p>
        <strong>Birth data.</strong> To calculate your birth chart we collect your birth date, birth time, and
        birth location (city/coordinates). Birth time and location can be sensitive, so we treat them carefully
        and use them only to provide the Service.
      </p>
      <p>
        <strong>People you add (&ldquo;connections&rdquo;).</strong> If you add family, friends, or partners to
        compare charts, you provide their name and birth details. You are responsible for having any necessary
        permission to add another person&rsquo;s information, and you agree to use it only for your personal,
        non-commercial use of the Service.
      </p>
      <p>
        <strong>Content you create.</strong> Journal entries, tarot and ritual activity, saved readings,
        preferences, and any bug reports or feedback you submit (including an optional screenshot of your screen
        and basic device details, if you choose to attach them).
      </p>
      <p>
        <strong>Payment information.</strong> Subscriptions are processed by Stripe. We do not see or store your
        full card number — Stripe handles payment details directly and shares only limited information (such as
        subscription status) with us.
      </p>
      <p>
        <strong>Technical information.</strong> Like most apps, we and our hosting provider automatically receive
        information such as your IP address, device and browser type, and basic usage and error logs, used to
        operate, secure, and improve the Service.
      </p>

      <LegalH2>How we use your information</LegalH2>
      <p>
        We use your information to: calculate and personalize your charts and readings; run the app&rsquo;s
        AI-assisted features (see below); maintain your account and sync your data across devices; process
        subscriptions; respond to support and bug reports; keep the Service secure; and improve our features.
      </p>

      <LegalH2>AI-assisted readings</LegalH2>
      <p>
        Several features (your daily horoscope, Dolly, journal prompts and reflections, and chart interpretations)
        are generated with the help of a third-party AI provider, Anthropic. To produce a reading, we send the
        relevant chart and celestial data and, where applicable, your first name to that provider. We send only
        what is needed to generate the reading. We do not send your email, password, or payment details to the AI
        provider. Please review the AI provider&rsquo;s own privacy terms for how they handle data processed
        through their API.
      </p>

      <LegalH2>Service providers we share data with</LegalH2>
      <p>
        We do not sell your personal information. We share it only with service providers that help us run the
        Service, under agreements that limit their use of it:
      </p>
      <p>
        &bull; <strong>Supabase</strong> — database, authentication, and file storage.<br />
        &bull; <strong>Anthropic</strong> — AI generation of readings, as described above.<br />
        &bull; <strong>Stripe</strong> — subscription and payment processing.<br />
        &bull; <strong>Vercel</strong> — application hosting and content delivery.<br />
        &bull; <strong>OpenStreetMap / Nominatim</strong> — converting a city name you search into coordinates.<br />
        &bull; <strong>Email and push delivery</strong> — to send you transactional messages and, if you opt in,
        push notifications.
      </p>
      <p>
        We may also disclose information if required by law, to protect our rights or users&rsquo; safety, or as
        part of a business transfer (e.g., merger or acquisition).
      </p>

      <LegalH2>Cookies and local storage</LegalH2>
      <p>
        We use essential cookies and your browser&rsquo;s local storage to keep you signed in and to remember
        your preferences and cached readings. We do not use third-party advertising or cross-site tracking
        cookies.
      </p>

      <LegalH2>Data retention and deletion</LegalH2>
      <p>
        We keep your information for as long as your account is active. You can delete your account at any time
        from Settings, which deletes your personal data from our systems (some information may persist briefly in
        backups or where retention is legally required). You can also remove individual connections, journal
        entries, and other content within the app.
      </p>

      <LegalH2>Your rights</LegalH2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, or export your personal
        information, and to object to or restrict certain processing. You can exercise many of these directly in
        the app (editing your data, deleting your account) or by contacting us at the address below. We will not
        discriminate against you for exercising these rights.
      </p>

      <LegalH2>Children</LegalH2>
      <p>
        The Service is not intended for children under 13 (or the minimum age required in your country, such as 16
        in parts of the EU). We do not knowingly collect personal information from children under that age. If you
        believe a child has provided us information, please contact us and we will delete it.
      </p>

      <LegalH2>Security and international transfers</LegalH2>
      <p>
        We use reasonable technical and organizational measures to protect your information, but no method of
        storage or transmission is completely secure. Our providers store and process data in the United States;
        if you access the Service from elsewhere, your information may be transferred to and processed in the U.S.
      </p>

      <LegalH2>Changes to this Policy</LegalH2>
      <p>
        We may update this Policy from time to time. If we make material changes, we will update the date above
        and, where appropriate, notify you in the app.
      </p>

      <LegalH2>Contact</LegalH2>
      <p>
        Questions about this Policy or your data? Email us at{" "}
        <a href="mailto:contacttaylorsometimes@gmail.com" className="text-terracotta hover:text-terracotta-light transition-colors">
          contacttaylorsometimes@gmail.com
        </a>
        .
      </p>
    </LegalShell>
  );
}
