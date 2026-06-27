import type { Metadata } from "next";
import LegalShell, { LegalH2 } from "@/components/LegalShell";

/*
 * ⚠️ REVIEW BEFORE LAUNCH (with legal counsel):
 *   - Governing law is set to Texas, USA (owner is based in Medina, TX).
 *   - Confirm the operating legal entity name (currently the trade name "Mapped")
 *     and your actual refund/cancellation terms.
 *   - Confirm minimum age (13 US / 16 EU) matches the Privacy Policy.
 * This is a solid, app-specific starting draft — not a substitute for legal advice.
 */

export const metadata: Metadata = {
  title: "Terms of Service — Mapped",
  description: "The terms that govern your use of Mapped.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 19, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Mapped (the &ldquo;Service&rdquo;). By
        creating an account or using the Service, you agree to these Terms and to our{" "}
        <a href="/privacy" className="text-terracotta hover:text-terracotta-light transition-colors">Privacy Policy</a>.
        If you do not agree, please do not use the Service.
      </p>

      <LegalH2>1. Who can use Mapped</LegalH2>
      <p>
        You must be at least 13 years old (or the minimum age required in your country) and able to form a binding
        contract to use the Service. If you use Mapped on behalf of someone else, you confirm you are authorized to
        do so.
      </p>

      <LegalH2>2. What Mapped is — and isn&rsquo;t</LegalH2>
      <p>
        Mapped provides astrology-based content for self-reflection, insight, and entertainment. <strong>It is not
        professional advice.</strong> Nothing in the Service is medical, mental-health, legal, financial, or other
        professional advice, and it should not be used as a substitute for consulting a qualified professional.
        Decisions you make based on the Service are your own responsibility. If you are in crisis or need help,
        please contact a qualified professional or your local emergency services.
      </p>

      <LegalH2>3. Your account</LegalH2>
      <p>
        You are responsible for the accuracy of the information you provide and for keeping your account secure.
        Keep your password confidential, and let us know promptly if you believe your account has been
        compromised. You are responsible for activity that happens under your account.
      </p>

      <LegalH2>4. Subscriptions and payments</LegalH2>
      <p>
        Some features require a paid subscription, processed by Stripe. By subscribing, you authorize us (through
        Stripe) to charge the applicable fees to your payment method. Unless stated otherwise, subscriptions renew
        automatically at the end of each billing period until you cancel. You can cancel at any time, and your paid
        access will continue until the end of the current period. Except where required by law, fees already paid
        are non-refundable. We may change prices on a going-forward basis with notice.
      </p>

      <LegalH2>5. Your content and the people you add</LegalH2>
      <p>
        You keep ownership of the content you create, such as journal entries and saved readings. You grant us a
        limited license to store and process that content solely to operate and provide the Service to you. When
        you add another person&rsquo;s birth details as a connection, you confirm that you have any necessary
        permission to do so and that you will use their information only for your personal use of the Service.
      </p>

      <LegalH2>6. Acceptable use</LegalH2>
      <p>
        Please don&rsquo;t misuse the Service. You agree not to: break the law; infringe others&rsquo; rights;
        attempt to access accounts or data that aren&rsquo;t yours; probe, scrape, overload, or disrupt the
        Service; reverse-engineer or copy it; or use it to harass or harm others.
      </p>

      <LegalH2>7. Intellectual property</LegalH2>
      <p>
        The Service, including its software, design, text, and original content, is owned by Mapped and protected
        by intellectual-property laws. We grant you a personal, non-exclusive, non-transferable license to use the
        Service for your own non-commercial use, subject to these Terms.
      </p>

      <LegalH2>8. Disclaimers</LegalH2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind,
        whether express or implied, including fitness for a particular purpose and non-infringement. We do not
        warrant that the Service will be uninterrupted, error-free, or that any reading or insight is accurate,
        reliable, or suitable for any purpose. Astrology content is for entertainment and reflection only.
      </p>

      <LegalH2>9. Limitation of liability</LegalH2>
      <p>
        To the fullest extent permitted by law, Mapped and its providers will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or for any loss of data, profits, or goodwill,
        arising from your use of the Service. Our total liability for any claim relating to the Service will not
        exceed the greater of the amount you paid us in the 12 months before the claim or US $50.
      </p>

      <LegalH2>10. Termination</LegalH2>
      <p>
        You may stop using the Service and delete your account at any time. We may suspend or terminate your access
        if you violate these Terms or to protect the Service or other users. Sections that by their nature should
        survive termination (such as disclaimers and limitations of liability) will continue to apply.
      </p>

      <LegalH2>11. Changes to these Terms</LegalH2>
      <p>
        We may update these Terms from time to time. If we make material changes, we will update the date above
        and, where appropriate, notify you in the app. Continuing to use the Service after changes take effect
        means you accept the updated Terms.
      </p>

      <LegalH2>12. Governing law</LegalH2>
      <p>
        These Terms are governed by the laws of the State of Texas, United States, without regard to its
        conflict-of-laws rules. You agree that any dispute relating to these Terms or the Service will be resolved
        in the state or federal courts located in Texas, unless applicable law requires otherwise.
      </p>

      <LegalH2>13. Contact</LegalH2>
      <p>
        Questions about these Terms? Email us at{" "}
        <a href="mailto:contacttaylorsometimes@gmail.com" className="text-terracotta hover:text-terracotta-light transition-colors">
          contacttaylorsometimes@gmail.com
        </a>
        .
      </p>
    </LegalShell>
  );
}
