import React from "react";
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const COLORS = {
  purple: "#9945FF",
  green: "#14F195",
  bg: "#0A0A0A",
  bgLight: "#141414",
  white: "#FFFFFF",
  gray: "#888888",
};

const FONT_MONO = "'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace";
const FONT_SANS =
  "'Inter', 'SF Pro Display', -apple-system, 'Segoe UI', Roboto, sans-serif";

const easeClamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 20], [0, 1], easeClamp);
  const scale = spring({ fps, frame: frame - 5, config: { damping: 100 } });
  const badge = spring({ fps, frame: frame - 30, config: { damping: 80 } });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.green})`,
          opacity,
        }}
      />
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 20px",
            border: `2px solid ${COLORS.green}`,
            borderRadius: 4,
            fontFamily: FONT_MONO,
            fontSize: 24,
            color: COLORS.green,
            marginBottom: 30,
            transform: `scale(${badge})`,
            opacity: badge,
          }}
        >
          SPL · TOKEN-2022
        </div>
        <h1
          style={{
            fontFamily: FONT_SANS,
            fontSize: 90,
            fontWeight: 800,
            color: COLORS.white,
            margin: 0,
            lineHeight: 1.1,
            opacity,
            transform: `scale(${scale})`,
            letterSpacing: "-0.02em",
          }}
        >
          Programmable Money
        </h1>
        <h1
          style={{
            fontFamily: FONT_SANS,
            fontSize: 90,
            fontWeight: 800,
            margin: "8px 0 0 0",
            lineHeight: 1.1,
            opacity,
            transform: `scale(${scale})`,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: COLORS.purple }}>on </span>
          <span style={{ color: COLORS.green }}>Solana</span>
        </h1>
        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 32,
            color: COLORS.gray,
            marginTop: 30,
            opacity,
          }}
        >
          Mint with transfer fees + on-chain metadata
        </p>
      </div>
    </AbsoluteFill>
  );
};

const ExtensionCard: React.FC<{
  name: string;
  desc: string;
  color: string;
  index: number;
}> = ({ name, desc, color, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = 15 + index * 12;
  const opacity = interpolate(frame, [start, start + 10], [0, 1], easeClamp);
  const x = spring({ fps, frame: frame - start, config: { damping: 90 } });
  const scale = interpolate(x, [0, 1], [-60, 0]);
  return (
    <div
      style={{
        opacity,
        transform: `translateX(${scale}px)`,
        marginBottom: 18,
        borderLeft: `4px solid ${color}`,
        paddingLeft: 20,
        background: COLORS.bgLight,
        padding: 24,
        borderRadius: 4,
      }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.white,
          marginBottom: 8,
        }}
      >
        {name}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.gray }}>
        {desc}
      </div>
    </div>
  );
};

const ExtensionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], easeClamp);
  const headerY = interpolate(frame, [0, 15], [30, 0], easeClamp);
  const extensions = [
    {
      name: "TransferFeeConfig",
      desc: "1% fee on every transfer",
      color: COLORS.purple,
    },
    {
      name: "MetadataPointer",
      desc: "On-chain metadata location",
      color: COLORS.green,
    },
    {
      name: "TokenMetadata",
      desc: "Name, symbol, URI baked into mint",
      color: "#FFA502",
    },
  ];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: 900 }}>
        <h2
          style={{
            fontFamily: FONT_SANS,
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.white,
            margin: 0,
            marginBottom: 10,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          Token-2022 Extensions
        </h2>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: 20,
            color: COLORS.gray,
            margin: 0,
            marginBottom: 40,
            opacity: headerOpacity,
          }}
        >
          Permanent at creation — cannot be added later
        </p>
        {extensions.map((ext, i) => (
          <ExtensionCard
            key={ext.name}
            name={ext.name}
            desc={ext.desc}
            color={ext.color}
            index={i}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const TransferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tokenX = interpolate(frame, [30, 90], [0, 1], easeClamp);
  const opacity = interpolate(frame, [0, 15], [0, 1], easeClamp);
  const mainHighlight = interpolate(frame, [20, 40], [1, 1.2], easeClamp);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontFamily: FONT_SANS,
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.white,
          margin: 0,
          marginBottom: 60,
          opacity,
        }}
      >
        Transfer Fee in Action
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: 80, opacity }}>
        <div
          style={{ textAlign: "center", transform: `scale(${mainHighlight})` }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              border: `2px solid ${COLORS.purple}`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 18,
                color: COLORS.gray,
              }}
            >
              SENDER
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 36,
                color: COLORS.white,
                marginTop: 8,
              }}
            >
              200
            </div>
          </div>
        </div>
        <div style={{ position: "relative", width: 300, height: 60 }}>
          <div
            style={{
              position: "absolute",
              left: `${tokenX * 100}%`,
              top: 0,
              transform: "translateX(-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.green})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 12,
              color: COLORS.white,
              fontWeight: 700,
            }}
          >
            BOOT
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 45,
              transform: "translateX(-50%)",
              fontFamily: FONT_MONO,
              fontSize: 18,
              color: COLORS.gray,
            }}
          >
            1% fee withheld
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 160,
              height: 160,
              border: `2px solid ${COLORS.green}`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 18,
                color: COLORS.gray,
              }}
            >
              RECEIVER
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 36,
                color: COLORS.white,
                marginTop: 8,
              }}
            >
              198
            </div>
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 16,
              color: COLORS.gray,
              marginTop: 10,
            }}
          >
            2 withheld as fee
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], easeClamp);
  const mintBytes = interpolate(frame, [20, 40], [0, 165], easeClamp);
  const ext1Bytes = interpolate(frame, [45, 60], [0, 115], easeClamp);
  const ext2Bytes = interpolate(frame, [55, 70], [0, 80], easeClamp);
  const ext3Bytes = interpolate(frame, [65, 80], [0, 150], easeClamp);
  const totalBytes = interpolate(frame, [20, 80], [0, 510], easeClamp);
  const totalScale = spring({
    fps,
    frame: frame - 80,
    config: { damping: 90 },
  });
  const totalOpacity = interpolate(frame, [80, 92], [0, 1], easeClamp);
  const ContainerWidth = 1200;
  const Scale = ContainerWidth / 510;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontFamily: FONT_SANS,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            margin: 0,
            marginBottom: 10,
            opacity: headerOpacity,
          }}
        >
          Account Data Layout
        </h2>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: 20,
            color: COLORS.gray,
            margin: 0,
            marginBottom: 50,
            opacity: headerOpacity,
          }}
        >
          Extensions packed after mint data
        </p>
        <div
          style={{
            display: "flex",
            width: ContainerWidth,
            height: 80,
            background: COLORS.bgLight,
            overflow: "hidden",
            border: `1px solid ${COLORS.gray}`,
          }}
        >
          <div
            style={{
              width: mintBytes * Scale,
              background: COLORS.purple,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 16,
              color: COLORS.white,
              fontWeight: 600,
            }}
          >
            {mintBytes > 60 && "Mint 165B"}
          </div>
          <div
            style={{
              width: ext1Bytes * Scale,
              background: "#7B2FCC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 14,
              color: COLORS.white,
              fontWeight: 600,
            }}
          >
            {ext1Bytes > 50 && "Fee 115B"}
          </div>
          <div
            style={{
              width: ext2Bytes * Scale,
              background: "#0FBF7A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 14,
              color: COLORS.bg,
              fontWeight: 600,
            }}
          >
            {ext2Bytes > 50 && "Ptr 80B"}
          </div>
          <div
            style={{
              width: ext3Bytes * Scale,
              background: "#CC7A00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 14,
              color: COLORS.white,
              fontWeight: 600,
            }}
          >
            {ext3Bytes > 50 && "Meta 150B"}
          </div>
        </div>
        <div
          style={{
            width: ContainerWidth,
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: FONT_MONO,
            fontSize: 16,
            color: COLORS.gray,
          }}
        >
          <span>0</span>
          <span style={{ color: COLORS.purple }}>165</span>
          <span style={{ color: "#7B2FCC" }}>280</span>
          <span style={{ color: "#0FBF7A" }}>360</span>
          <span style={{ color: "#FFA502" }}>510</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontFamily: FONT_MONO,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.green,
            opacity: totalOpacity,
            transform: `scale(${totalScale})`,
          }}
        >
          {Math.round(totalBytes)} bytes total
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15], [0, 1], easeClamp);
  const scale = spring({ fps, frame: frame - 10, config: { damping: 100 } });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.green})`,
        }}
      />
      <div
        style={{ textAlign: "center", opacity, transform: `scale(${scale})` }}
      >
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 56,
            fontWeight: 800,
            color: COLORS.white,
            marginBottom: 20,
          }}
        >
          Building in Public
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            color: COLORS.gray,
            marginBottom: 30,
          }}
        >
          Encode Club Solana Bootcamp
        </div>
        <div
          style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.green }}
        >
          #Solana #BuildInPublic #Web3 #EncodeClub
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Token2022Video: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <TitleScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <ExtensionsScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <TransferScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <DataScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
