import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** The logotype file is 1424x388; the picture draws it 56px tall. */
const LOGO = { width: 206, height: 56 };

/**
 * The picture shown when a link to the site is shared: the logotype, what
 * Antiginx is, and three findings in the style of the hero's scanner. In
 * English, as the default language; a shared link's preview cannot follow
 * the reader's.
 */
export const alt = "Antiginx, website security scanner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FINDINGS = [
  { text: "nginx version exposed", color: "#fcd34d" },
  { text: "No HSTS header", color: "#f87171" },
  { text: "TLS 1.3, valid certificate", color: "#34d399" },
];

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logotype.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#09090b",
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          color: "#ffffff",
        }}
      >
        <img src={logoSrc} alt="" width={LOGO.width} height={LOGO.height} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 }}>Website security scanner</div>
          <div style={{ marginTop: 20, fontSize: 30, color: "#a1a1aa" }}>
            Headers, certificate, cookies, DNS and the signs of phishing, in one scan.
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {FINDINGS.map((finding) => (
            <div
              key={finding.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                border: "3px solid #22d3ee",
                borderRadius: 12,
                backgroundColor: "#09090b",
                fontSize: 26,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: finding.color }} />
              {finding.text}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
