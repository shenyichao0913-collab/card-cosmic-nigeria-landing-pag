"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

const APP_STORE_URL =
  "https://apps.apple.com/ng/app/cardcosmic/id6756063147";
const APP_STORE_IOS_URL =
  "itms-apps://itunes.apple.com/app/id6756063147";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=app.com.cardlaxy&pli=1";

// Nigeria observes WAT (UTC+1) year-round. These UTC boundaries represent
// Aug 22, 2026 00:00 WAT through Aug 25, 2026 23:59:59 WAT.
const CAMPAIGN_START_UTC = Date.UTC(2026, 7, 21, 23, 0, 0);
const CAMPAIGN_END_UTC = Date.UTC(2026, 7, 25, 23, 0, 0);

type CampaignStatus = "upcoming" | "active" | "ended";

function getCampaignStatus(now: number): CampaignStatus {
  if (now < CAMPAIGN_START_UTC) return "upcoming";
  if (now < CAMPAIGN_END_UTC) return "active";
  return "ended";
}

function getCampaignCountdown(now: number, target: number) {
  const remaining = Math.max(0, target - now);
  return {
    hours: Math.floor(remaining / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1_000),
  };
}

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

const screenshots = [
  { src: "/assets/app-home.png?v=12", label: "Home", detail: "Rates and balance" },
  { src: "/assets/app-trade.png?v=12", label: "Trade", detail: "Transaction history" },
  { src: "/assets/app-secure.png?v=12", label: "Track", detail: "Order details" },
  { src: "/assets/app-withdraw.png?v=12", label: "Cash out", detail: "Completed withdrawal" },
];

const faqs = [
  {
    question: "Who is eligible for the ₦3,000 welcome reward?",
    answer:
      "The offer is intended for eligible new Card Cosmic users who download the app, register, and enter invitation code 555555. Card Cosmic reward terms and availability apply.",
  },
  {
    question: "Where do I enter invitation code 555555?",
    answer:
      "Enter the code when prompted during your new-account registration flow. Copy it before opening the app so it is ready to paste.",
  },
  {
    question: "Is the ₦3,000 paid automatically?",
    answer:
      "The code makes qualifying new users eligible for the welcome reward; it is not an unconditional cash guarantee. Your account must satisfy the current promotional terms.",
  },
  {
    question: "Which gift cards can I trade?",
    answer:
      "Card Cosmic supports popular cards including Apple, Steam, Razer Gold, Visa, Walmart and other available brands shown inside the app.",
  },
  {
    question: "How can I get help with a transaction?",
    answer:
      "Use the support area inside the app or email support@cardcosmic.com for assistance with an order or withdrawal.",
  },
];

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
  }
}

function track(
  metaEvent: string,
  gaEvent: string,
  parameters: Record<string, string> = {},
) {
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", metaEvent, parameters);
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: gaEvent,
      source: "landing_page",
      ...parameters,
    });
  }
}

function openAppStore(event: MouseEvent<HTMLAnchorElement>) {
  track("AppDownloadClick", "app_download_click", {
    app_name: "Card Cosmic",
    store: "apple_app_store",
    destination_url: APP_STORE_URL,
  });

  const isIOS =
    /iPad|iPhone|iPod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);

  if (isIOS) {
    event.preventDefault();
    window.location.assign(APP_STORE_IOS_URL);
  }
}

function StoreButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`store-row ${className}`.trim()} aria-label="Download Card Cosmic">
      <a
        className="store-button"
        href={APP_STORE_URL}
        target="_self"
        onClick={openAppStore}
        aria-label="Download Card Cosmic on the App Store"
      >
        <img src="/assets/appstore.svg" alt="Download on the App Store" />
      </a>
      <a
        className="store-button"
        href={GOOGLE_PLAY_URL}
        target="_self"
        onClick={() =>
          track("AppDownloadClick", "app_download_click", {
            app_name: "Card Cosmic",
            store: "google_play",
            destination_url: GOOGLE_PLAY_URL,
          })
        }
        aria-label="Get Card Cosmic on Google Play"
      >
        <img src="/assets/googleplay.svg" alt="Get it on Google Play" />
      </a>
    </div>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [activeShot, setActiveShot] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [campaignNow, setCampaignNow] = useState(() => Date.now());
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track("PageView", "page_view");
    const timer = window.setInterval(() => setCampaignNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const campaignStatus = getCampaignStatus(campaignNow);
  const campaignCountdown = getCampaignCountdown(
    campaignNow,
    campaignStatus === "upcoming" ? CAMPAIGN_START_UTC : CAMPAIGN_END_UTC,
  );

  async function copyCode() {
    await navigator.clipboard.writeText("555555");
    setCopied(true);
    track("CopyInviteCode", "copy_code");
    window.setTimeout(() => setCopied(false), 1800);
  }

  function focusDownloadOptions() {
    downloadRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    downloadRef.current?.focus({ preventScroll: true });
    track("MobileDownload", "button_click");
  }

  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav shell" aria-label="Main navigation">
          <a href="#top" className="brand" aria-label="Card Cosmic home">
            <img src="/assets/logo-cosmic.svg" alt="Card Cosmic" />
          </a>
          <StoreButtons className="nav-store-row" />
        </nav>

        <div className="hero-grid shell campaign-hero-grid">
          <section
            className={`campaign-card campaign-${campaignStatus}`}
            aria-labelledby="campaign-title"
          >
            {campaignStatus === "ended" ? (
              <div className="campaign-ended-panel">
                <span className="campaign-ended-badge">Campaign Ended</span>
                <h1 id="campaign-title">
                  The ₦3,000 Welcome Campaign Has Ended
                </h1>
                <p>
                  Thank you for your interest in Card Cosmic. Stay connected
                  for future campaigns and updates.
                </p>
                <StoreButtons className="ended-store-row" />
              </div>
            ) : (
              <>
                <div className="campaign-badges">
                  <span>🔥 Limited Time Offer</span>
                  <span>🇳🇬 Nigeria New Users Only</span>
                </div>

                <div className="campaign-countdown" aria-live="polite">
                  <span>
                    {campaignStatus === "active"
                      ? "Campaign Ends In"
                      : "Campaign Starts In"}
                  </span>
                  <div className="countdown-units">
                    <strong>
                      {twoDigits(campaignCountdown.hours)}
                      <small>Hours</small>
                    </strong>
                    <b aria-hidden="true">:</b>
                    <strong>
                      {twoDigits(campaignCountdown.minutes)}
                      <small>Minutes</small>
                    </strong>
                    <b aria-hidden="true">:</b>
                    <strong>
                      {twoDigits(campaignCountdown.seconds)}
                      <small>Seconds</small>
                    </strong>
                  </div>
                </div>

                <div className="campaign-headline">
                  <span>Limited Time Welcome Campaign</span>
                  <h1 id="campaign-title">
                    Join Card Cosmic Today
                    <strong>Unlock Your ₦3,000 Welcome Benefit</strong>
                  </h1>
                </div>

                <p className="campaign-support">
                  <strong>New to Card Cosmic?</strong> Register your account and
                  enter invitation number 555555 during the campaign period to
                  become eligible for the Nigeria new-user welcome benefit.
                </p>

                <div className="campaign-reward" aria-label="New user benefit ₦3,000">
                  <span>🎁 New User Benefit</span>
                  <strong>₦3,000</strong>
                  <div className="reward-requirements">
                    <span>Complete registration</span>
                    <b>+</b>
                    <span>Enter invitation number</span>
                    <strong>555555</strong>
                    <small>During campaign period</small>
                  </div>
                </div>

                <div className="campaign-date">
                  <span>Campaign Period (Nigeria Time)</span>
                  <strong>August 22 – August 25, 2026</strong>
                </div>

                <ol
                  className="registration-flow campaign-steps"
                  aria-label="Card Cosmic registration steps"
                >
                  <li>
                    <span>01</span>
                    <div>
                      <strong>Download Card Cosmic</strong>
                      <small>Get the app from App Store or Google Play.</small>
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <strong>Create Your Account</strong>
                      <small>Register as a new Card Cosmic user.</small>
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <strong>Enter Invitation Number</strong>
                      <small>
                        Enter 555555 during registration to participate in the
                        campaign.
                      </small>
                    </div>
                  </li>
                </ol>

                <div className="code-card campaign-invite" aria-label="Campaign invitation number">
                  <div>
                    <span className="code-label">Campaign Invitation Number</span>
                    <strong className="code-value">555555</strong>
                  </div>
                  <button type="button" onClick={copyCode} aria-live="polite">
                    {copied ? "Copied!" : "Copy Number"}
                  </button>
                </div>

                <div
                  className="download-panel campaign-download"
                  id="download"
                  ref={downloadRef}
                  tabIndex={-1}
                >
                  <span className="download-panel-label">Download the official app</span>
                  <StoreButtons className="hero-store-row" />
                </div>

                <div className="campaign-eligibility">
                  <strong>Campaign eligibility</strong>
                  <p>
                    Eligible Nigerian new users only. Registration and invitation
                    number entry must be completed during the campaign period.
                    Campaign terms apply.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="trust-strip shell" aria-label="Key benefits">
          <span>Competitive rates</span>
          <span>Fast withdrawals</span>
          <span>Secure trading</span>
          <span>Professional support</span>
        </div>
      </section>

      <section className="section benefits-section" id="benefits">
        <div className="shell">
          <div className="section-heading heading-split">
            <div>
              <span className="kicker">Built for better trades</span>
              <h2>More value. Less waiting.</h2>
            </div>
            <p>
              Clear rates, fast payouts, secure trading and reliable support—all
              in one focused experience.
            </p>
          </div>

          <div className="benefit-grid">
            {[
              ["01", "Competitive rates", "Better value for popular gift cards."],
              ["02", "Fast withdrawal", "Quick payouts after successful trades."],
              ["03", "Secure trading", "Track every order from start to finish."],
              ["04", "Professional support", "Reliable help whenever you need it."],
            ].map(([number, title, copy]) => (
              <article className="benefit-card" key={title}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section cards-section" id="gift-cards">
        <div className="shell card-band">
          <div className="section-heading centered-heading">
            <span className="kicker">Popular gift cards</span>
            <h2>Trade the cards you already have</h2>
            <p>Choose a supported brand in the app and follow the guided trade flow.</p>
          </div>

          <div className="gift-card-grid" aria-label="Supported gift card brands">
            <div className="gift-card gift-apple">
              <img src="/assets/card-apple.png" alt="Apple" />
              <strong>Apple</strong>
            </div>
            <div className="gift-card gift-steam">
              <img src="/assets/card-steam.png" alt="Steam" />
              <strong>Steam</strong>
            </div>
            <div className="gift-card gift-razer">
              <img src="/assets/card-razer.png" alt="Razer Gold" />
              <strong>Razer Gold</strong>
            </div>
            <div className="gift-card gift-visa">
              <span className="wordmark">VISA</span>
              <strong>Visa</strong>
            </div>
            <div className="gift-card gift-walmart">
              <span className="wordmark">Walmart✳</span>
              <strong>Walmart</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section steps-section" id="how-it-works">
        <div className="shell">
          <div className="section-heading centered-heading compact-heading">
            <span className="kicker">How it works</span>
            <h2>From download to payout in five clear steps</h2>
          </div>

          <ol className="steps-list">
            {[
              ["Download", "Get Card Cosmic from your app store."],
              ["Register", "Create your new Card Cosmic account."],
              ["Choose", "Select the gift card you want to trade."],
              ["Trade", "Submit the details and follow its status."],
              ["Withdraw", "Cash out after a successful trade."],
            ].map(([title, copy], index) => (
              <li key={title}>
                <span>{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section showcase-section" id="app">
        <div className="shell showcase-grid">
          <div className="showcase-copy">
            <span className="kicker light-kicker">Real user activity</span>
            <h2>Real trades. Real outcomes.</h2>
            <p>
              Explore privacy-protected screenshots from real Card Cosmic user
              transactions, including trading, order tracking and completed
              cash-outs. Personal details and card codes have been blurred for
              safety.
            </p>

            <div className="shot-tabs" role="tablist" aria-label="App screens">
              {screenshots.map((shot, index) => (
                <button
                  key={shot.label}
                  type="button"
                  role="tab"
                  aria-selected={activeShot === index}
                  onClick={() => setActiveShot(index)}
                  className={activeShot === index ? "active" : ""}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{shot.label}</strong>
                    <small>{shot.detail}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="showcase-phone" role="tabpanel">
            <div className="phone-glow" />
            <img
              src={screenshots[activeShot].src}
              alt={`Privacy-protected real Card Cosmic user ${screenshots[activeShot].label} transaction screen`}
            />
            <span className="official-tag">Real user transaction</span>
          </div>
        </div>
      </section>

      <section className="section reviews-section" id="reviews">
        <div className="shell">
          <div className="section-heading heading-split review-heading">
            <div>
              <span className="kicker">What users say</span>
              <h2>Simple, fast and reliable</h2>
            </div>
            <p>Short excerpts from public Card Cosmic app-store reviews.</p>
          </div>

          <div className="review-grid">
            {[
              ["★★★★★", "It’s a good app for trading gift cards. They also have good rates.", "Paul Michael", "PM"],
              ["★★★★★", "I love Card Cosmic — so fast and reliable.", "Chizyemzy", "CH"],
              ["★★★★☆", "Good rates and fast transactions. I highly recommend it for gift card traders.", "Esther Chukwude", "EC"],
            ].map(([stars, quote, name, initials]) => (
              <figure className="review-card" key={name}>
                <div className="stars" aria-label={`${stars.length} star review`}>
                  {stars}
                </div>
                <blockquote>“{quote}”</blockquote>
                <figcaption>
                  <span>{initials}</span>
                  <div>
                    <strong>{name}</strong>
                    <small>Public app review</small>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="review-note">Individual experiences may vary.</p>
        </div>
      </section>

      <section className="section security-section" id="support">
        <div className="shell security-grid">
          <div className="security-copy">
            <span className="kicker light-kicker">Security & support</span>
            <h2>Trade with clarity at every step</h2>
            <p>
              Card Cosmic’s public app listings describe encrypted data in
              transit, order status updates and customer support when you need
              help.
            </p>
            <ul className="security-list">
              <li><span>✓</span> Data encrypted in transit</li>
              <li><span>✓</span> Order status tracking</li>
              <li><span>✓</span> Data deletion requests supported</li>
              <li><span>✓</span> Customer support available</li>
            </ul>
            <a
              className="support-button"
              href="mailto:support@cardcosmic.com"
              onClick={() => track("ClickSupport", "button_click")}
            >
              Email support
            </a>
          </div>
          <div className="security-device">
            <div className="security-code">
              <span>Use invite code</span>
              <strong>555555</strong>
            </div>
            <img
              src="/assets/devices.png"
              alt="Official Card Cosmic app screens on two iPhones"
            />
          </div>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="shell faq-grid">
          <div className="faq-intro">
            <span className="kicker">Questions, answered</span>
            <h2>Before you get started</h2>
            <p>
              Keep the invitation code handy, register as a new user and check
              the current promotion terms in the app.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <b aria-hidden="true">{isOpen ? "−" : "+"}</b>
                  </button>
                  {isOpen && <p>{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="final-cta" id="final-download">
        <div className="cta-orb orb-a" />
        <div className="cta-orb orb-b" />
        <div className="shell final-cta-inner">
          <span className="kicker light-kicker">Ready when you are</span>
          <h2>Copy 555555. Download Card Cosmic. Get started.</h2>
          <p>
            Register as a new user and enter the invitation code to become
            eligible for the ₦3,000 welcome reward.
          </p>
          <div className="cta-actions">
            <button type="button" onClick={copyCode}>
              {copied ? "Code copied!" : "Copy code 555555"}
            </button>
            <StoreButtons className="compact-store-row" />
          </div>
          <small>New users only. Reward eligibility and current terms apply.</small>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <img src="/assets/logo-cosmic.svg" alt="Card Cosmic" />
          <div className="footer-links">
            <a href="https://www.cardcosmic.com/privacy" target="_blank" rel="noreferrer">Privacy</a>
            <a href="https://www.cardcosmic.com/terms" target="_blank" rel="noreferrer">Terms</a>
            <a href="mailto:support@cardcosmic.com">Support</a>
          </div>
          <p>© {new Date().getFullYear()} Card Cosmic. All rights reserved.</p>
        </div>
      </footer>

      <div className="mobile-download-bar" aria-label="Mobile download prompt">
        <div>
          <small>Invite code</small>
          <strong>555555</strong>
        </div>
        <a
          href="#download"
          onClick={(event) => {
            event.preventDefault();
            focusDownloadOptions();
          }}
        >
          Download app
        </a>
      </div>
    </main>
  );
}
