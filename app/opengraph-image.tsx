import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.full;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card that renders when the link is pasted anywhere. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070B12",
          padding: "72px 80px",
          // Satori has no serif loaded; its default sans renders cleanly here.
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#FF5E3F",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              color: "#94A3B8",
              textTransform: "uppercase",
            }}
          >
            Zee Palm Labs
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 104,
              lineHeight: 1,
              color: "#F1F5F9",
              letterSpacing: -2,
            }}
          >
            Anatomy of a Repetition
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              lineHeight: 1.35,
              color: "#94A3B8",
              maxWidth: 900,
            }}
          >
            See the work, not just the shape — which muscles fire, how hard, and at
            which inch of the range.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 14,
              borderRadius: 999,
              background:
                "linear-gradient(to right, #384457 0%, #7E4842 28%, #CE4A30 60%, #FF6C4A 100%)",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              letterSpacing: 3,
              color: "#94A3B8",
              textTransform: "uppercase",
            }}
          >
            <span>Resting</span>
            <span>zeepalm.com</span>
            <span>Maximal</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
