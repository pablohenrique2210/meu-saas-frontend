import { ImageResponse } from "next/og";

export const alt =
  "Lilian Arruda, consultoria, educação e saúde corporativa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#FAF7F4",
        color: "#241A1D",
        display: "flex",
        height: "100%",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          border: "2px solid #E9E0E2",
          borderRadius: 40,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
        }}
      >
        <div style={{ color: "#641C32", display: "flex", fontSize: 34 }}>
          Lilian Arruda
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 66,
            fontWeight: 600,
            letterSpacing: "-2px",
            lineHeight: 1.08,
            maxWidth: 920,
          }}
        >
          Educação e saúde corporativa para empresas mais fortes.
        </div>
        <div style={{ color: "#776A6E", display: "flex", fontSize: 25 }}>
          Riscos psicossociais, liderança e cultura do cuidado
        </div>
      </div>
    </div>,
    size,
  );
}

