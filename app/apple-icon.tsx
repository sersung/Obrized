import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2563eb",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "88px",
            height: "88px",
            background: "white",
            borderRadius: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "56px",
            fontWeight: "900",
            color: "#2563eb",
          }}
        >
          O
        </div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "white",
            letterSpacing: "-0.5px",
          }}
        >
          Obrized
        </div>
      </div>
    ),
    { ...size }
  );
}
