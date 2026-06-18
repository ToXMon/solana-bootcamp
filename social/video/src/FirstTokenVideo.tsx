import React from 'react';
import {
  AbsoluteFill,
  Series,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  Easing,
} from 'remotion';

// Solana brand colors
const COLORS = {
  bg: '#0A0A0A',
  purple: '#9945FF',
  green: '#14F195',
  white: '#FFFFFF',
  gray: '#8B8B8B',
  darkGray: '#1A1A1A',
};

const MINT_FULL = 'GuHNePASqcVf8228AnCzSj2kMoVJpFoYw7N8DpAyXZpy';
const MINT_SHORT = 'GuHNe...XZpy';

// ============ Scene 1: Title Card (90 frames = 3s) ============
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleScale = spring({
    fps,
    frame: frame - 10,
    config: {damping: 12, stiffness: 100, mass: 0.8},
  });

  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleY = interpolate(frame, [30, 60], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const lineScale = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${titleScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 120,
            height: 4,
            backgroundColor: COLORS.purple,
            marginBottom: 30,
            transform: `scaleX(${lineScale})`,
            transformOrigin: 'center',
          }}
        />
        <h1
          style={{
            fontFamily: 'sans-serif',
            fontSize: 96,
            fontWeight: 800,
            color: COLORS.white,
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          My First SPL Token
        </h1>
        <h2
          style={{
            fontFamily: 'sans-serif',
            fontSize: 52,
            fontWeight: 600,
            margin: 0,
            marginTop: 10,
            background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.green})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          on Solana
        </h2>
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 30,
            fontFamily: 'sans-serif',
            fontSize: 28,
            color: COLORS.gray,
            letterSpacing: 2,
          }}
        >
          DEVNET · ENCODE CLUB BOOTCAMP
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 2: Mint Address (120 frames = 4s) ============
const MintScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const addressScale = spring({
    fps,
    frame: frame - 15,
    config: {damping: 14, stiffness: 90},
  });

  // Glow pulse
  const glow = interpolate(
    Math.sin((frame - 30) * 0.08),
    [-1, 1],
    [10, 40],
  );

  const screenshotOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const screenshotScale = spring({
    fps,
    frame: frame - 50,
    config: {damping: 16, stiffness: 80},
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            opacity: labelOpacity,
            fontFamily: 'sans-serif',
            fontSize: 32,
            color: COLORS.green,
            letterSpacing: 3,
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          ◆ Token Mint Created
        </div>

        <div
          style={{
            transform: `scale(${addressScale})`,
            padding: '24px 48px',
            backgroundColor: COLORS.darkGray,
            borderRadius: 16,
            border: `2px solid ${COLORS.purple}`,
            boxShadow: `0 0 ${glow}px ${COLORS.purple}, 0 0 ${glow * 2}px ${COLORS.purple}40`,
            fontFamily: 'monospace',
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: 2,
          }}
        >
          {MINT_SHORT}
        </div>

        <div
          style={{
            opacity: screenshotOpacity,
            transform: `scale(${screenshotScale})`,
            marginTop: 40,
            borderRadius: 12,
            overflow: 'hidden',
            border: `1px solid ${COLORS.darkGray}`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.6)`,
          }}
        >
          <Img
            src={staticFile('first-token-mint-explorer.png')}
            style={{
              width: 800,
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 3: Stats (120 frames = 4s) ============
const StatCard: React.FC<{
  label: string;
  value: string;
  delay: number;
  accent: string;
}> = ({label, value, delay, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: {damping: 14, stiffness: 90},
  });

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        width: 360,
        padding: '40px 30px',
        backgroundColor: COLORS.darkGray,
        borderRadius: 20,
        border: `2px solid ${accent}30`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: `0 8px 30px rgba(0,0,0,0.4)`,
      }}
    >
      <div
        style={{
          fontFamily: 'sans-serif',
          fontSize: 22,
          color: COLORS.gray,
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 16,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'sans-serif',
          fontSize: 64,
          fontWeight: 800,
          color: accent,
        }}
      >
        {value}
      </div>
    </div>
  );
};

const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          fontFamily: 'sans-serif',
          fontSize: 36,
          color: COLORS.white,
          marginBottom: 50,
          fontWeight: 600,
        }}
      >
        Token Specs
      </div>
      <div
        style={{
          display: 'flex',
          gap: 40,
        }}
      >
        <StatCard
          label="Supply"
          value="1,000"
          delay={20}
          accent={COLORS.purple}
        />
        <StatCard
          label="Decimals"
          value="9"
          delay={35}
          accent={COLORS.green}
        />
        <StatCard
          label="Network"
          value="Devnet"
          delay={50}
          accent={COLORS.white}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 4: Transfer Animation (120 frames = 4s) ============
const TransferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Token travels from wallet A to wallet B
  const transferProgress = interpolate(frame, [30, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const startX = -300;
  const endX = 300;
  const tokenX = interpolate(transferProgress, [0, 1], [startX, endX]);

  // Token scale grows then shrinks
  const tokenScale = interpolate(
    transferProgress,
    [0, 0.3, 0.7, 1],
    [0.5, 1.2, 1.2, 0.8],
  );

  // Amount counter
  const amountDisplay = Math.round(interpolate(frame, [30, 80], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

  const screenshotOpacity = interpolate(frame, [85, 105], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const screenshotScale = spring({
    fps,
    frame: frame - 85,
    config: {damping: 16, stiffness: 80},
  });

  const walletBoxStyle: React.CSSProperties = {
    width: 200,
    height: 200,
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    border: `2px solid ${COLORS.gray}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'sans-serif',
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: 'sans-serif',
          fontSize: 32,
          color: COLORS.green,
          letterSpacing: 3,
          marginBottom: 50,
          textTransform: 'uppercase',
        }}
      >
        ◆ Transferring 100 Tokens
      </div>

      <div
        style={{
          position: 'relative',
          width: 800,
          height: 250,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Wallet A (sender) */}
        <div
          style={{
            ...walletBoxStyle,
            borderColor: COLORS.purple,
          }}
        >
          <div style={{fontSize: 18, color: COLORS.gray}}>WALLET A</div>
          <div style={{fontSize: 40, color: COLORS.white, fontWeight: 700}}>
            Sender
          </div>
        </div>

        {/* Traveling token */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translateX(${tokenX}px) scale(${tokenScale})`,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.green})`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'sans-serif',
            fontSize: 36,
            fontWeight: 800,
            color: COLORS.white,
            boxShadow: `0 0 30px ${COLORS.purple}80`,
          }}
        >
          {amountDisplay}
        </div>

        {/* Dotted path */}
        <div
          style={{
            position: 'absolute',
            left: '20%',
            right: '20%',
            top: '50%',
            height: 2,
            borderTop: `2px dashed ${COLORS.gray}`,
            opacity: 0.4,
          }}
        />

        {/* Wallet B (receiver) */}
        <div
          style={{
            ...walletBoxStyle,
            borderColor: COLORS.green,
          }}
        >
          <div style={{fontSize: 18, color: COLORS.gray}}>WALLET B</div>
          <div style={{fontSize: 40, color: COLORS.white, fontWeight: 700}}>
            Receiver
          </div>
        </div>
      </div>

      {/* Screenshot of transfer tx */}
      <div
        style={{
          opacity: screenshotOpacity,
          transform: `scale(${screenshotScale})`,
          marginTop: 30,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${COLORS.darkGray}`,
          boxShadow: `0 10px 40px rgba(0,0,0,0.6)`,
        }}
      >
        <Img
          src={staticFile('first-token-transfer-tx-explorer.png')}
          style={{
            width: 700,
            height: 'auto',
            display: 'block',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 5: Outro (90 frames = 3s) ============
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleScale = spring({
    fps,
    frame: frame - 5,
    config: {damping: 12, stiffness: 100},
  });

  const subtitleOpacity = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const hashtagsOpacity = interpolate(frame, [45, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${titleScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.white,
            textAlign: 'center',
          }}
        >
          Building in Public
        </div>
        <div
          style={{
            opacity: subtitleOpacity,
            fontFamily: 'sans-serif',
            fontSize: 38,
            fontWeight: 600,
            marginTop: 16,
            background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.green})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Encode Club Solana Bootcamp
        </div>
        <div
          style={{
            opacity: hashtagsOpacity,
            fontFamily: 'sans-serif',
            fontSize: 26,
            color: COLORS.gray,
            marginTop: 40,
            letterSpacing: 1,
          }}
        >
          #Solana #BuildInPublic #Web3 #EncodeClub
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ Main Composition ============
export const FirstTokenVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <TitleScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <MintScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <StatsScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <TransferScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
