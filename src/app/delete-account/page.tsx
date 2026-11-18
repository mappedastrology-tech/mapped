import type { Metadata } from "next";
import LegalShell, { LegalH2 } from "@/components/LegalShell";
import DeleteAccountPanel from "./DeleteAccountPanel";

/*
 * Public account-deletion page — /delete-account.
 *
 * Google Play requires a web page, reachable without the app, that names the
 * app as listed ("Mapped") and explains how to ask for an account to be
 * deleted and what is deleted. This is the URL to give in Play Console →
 * App content → Data safety → Delete account URL.
 *
 * The explanation is plain static text so it reads with or without
 * JavaScript; only the sign-in-and-delete box is a client component
 * (DeleteAccountPanel). Nothing here runs on a server, so it is safe in the
 * static export the apps are built from.
 *
 * Keep "What gets deleted" true to api/account/delete. In particular: a
 * website (Stripe) subscription IS cancelled by deleting, and deletion stops
 * if that cancel fails; an App Store or Google Play subscription is not.
 */

export const metadata: Metadata = {
  title: "Delete your Mapped account",
  description: "How to delete your Mapped account and everything in it, with or without the app.",
};

export default function DeleteAccountPage() {
  return (
    <LegalShell title="Delete your Mapped account" updated="November 18, 2026">
      <p>
        You can delete your Mapped account at any time, from the app or from this page. Deleting is permanent:
        once it&rsquo;s done we can&rsquo;t undo it or get anything back.
      </p>

      <LegalH2>What gets deleted</LegalH2>
      <p>
        Everything in your account. That means your birth chart and the people you&rsquo;ve added, your journal,
        your conversations with Dolly and what she remembers about you, your readings, tarot pulls and rituals,
        your course progress, your profile photo and settings, and our record of your plan and purchases. Your
        sign-in is deleted last, so the account itself is gone too.
      </p>
      <p>
        Bug reports you sent us are kept so we can fix what you told us about, but your email address and any
        screenshot are removed from them first. Copies can last a short while in our backups before they expire.
        Apple, Google and Stripe keep their own records of any payments you made, as payment law requires.
      </p>

      <LegalH2>Subscriptions</LegalH2>
      <p>
        If you subscribed on the Mapped website, deleting your account cancels that subscription for you. If we
        can&rsquo;t cancel it at that moment, we leave your account alone and ask you to try again, so you are
        never charged for an account that no longer exists.
      </p>
      <p>
        If you subscribed in the iPhone or Android app, Apple or Google bills you, and deleting your account does
        not cancel it. Cancel it in your phone&rsquo;s subscription settings: on iPhone, Settings &rarr; your name
        &rarr; Subscriptions; on Android, the Google Play Store &rarr; your profile picture &rarr; Payments &amp;
        subscriptions &rarr; Subscriptions.
      </p>

      <LegalH2>Delete it in the app</LegalH2>
      <p>
        Open the menu, tap <strong>Account</strong>, scroll to the bottom and tap <strong>Delete account</strong>,
        then confirm.
      </p>

      <LegalH2>Delete it here, without the app</LegalH2>
      <DeleteAccountPanel />

      <LegalH2>Or email us</LegalH2>
      <p>
        If you can&rsquo;t sign in, email{" "}
        <a href="mailto:mappedastrology@gmail.com?subject=Delete%20my%20Mapped%20account" className="text-terracotta hover:text-terracotta-light transition-colors">
          mappedastrology@gmail.com
        </a>{" "}
        from the address you use for Mapped and ask us to delete your account. We&rsquo;ll delete it and reply to
        let you know it&rsquo;s done.
      </p>
    </LegalShell>
  );
}
