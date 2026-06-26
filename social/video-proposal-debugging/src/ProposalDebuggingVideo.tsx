import React from 'react';
import {
  AbsoluteFill,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const COLORS = {
  bg: '#05070A',
  panel: '#0D1117',
  panel2: '#111827',
  green: '#14F195',
  purple: '#9945FF',
  yellow: '#FBBF24',
  red: '#F87171',
  blue: '#60A5FA',
  white: '#F9FAFB',
  gray: '#9CA3AF',
  dim: '#4B5563',
};

const FONT_MONO = "'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace";
const FONT_SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Shell: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 16], [0, 1], clamp);
  const y = interpolate(frame, [0, 16], [30, 0], clamp);
  return (
    <AbsoluteFill style={{background: COLORS.bg, padding: 86}}>
      <div style={{fontFamily: FONT_MONO, color: COLORS.green, fontSize: 22, marginBottom: 30, opacity}}>
        SOLANA BOOTCAMP · EXERCISE 7 · {label}
      </div>
      <div style={{opacity, transform: `translateY(${y}px)`, height: '100%'}}>{children}</div>
    </AbsoluteFill>
  );
};

const CodeBlock: React.FC<{lines: string[]; color?: string}> = ({lines, color = COLORS.green}) => (
  <div style={{background: COLORS.panel, border: `1px solid ${COLORS.dim}`, borderRadius: 18, padding: 34, fontFamily: FONT_MONO, fontSize: 30, lineHeight: 1.55, color}}>
    {lines.map((line, i) => <div key={i}>{line}</div>)}
  </div>
);

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({fps, frame: frame - 6, config: {damping: 90}});
  const fade = interpolate(frame, [0, 22], [0, 1], clamp);
  return (
    <Shell label="POSTMORTEM">
      <div style={{height: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT_MONO, color: COLORS.red, fontSize: 32, marginBottom: 28, opacity: fade}}>LIVE DEMO BUG</div>
        <h1 style={{fontFamily: FONT_SANS, fontSize: 104, lineHeight: 1.02, color: COLORS.white, margin: 0, letterSpacing: '-0.05em', transform: `scale(${scale})`, transformOrigin: 'left center'}}>
          My Solana UI<br />was lying.
        </h1>
        <p style={{fontFamily: FONT_SANS, fontSize: 38, color: COLORS.gray, maxWidth: 1180, marginTop: 34, opacity: fade}}>
          The chain had proposals. The frontend said: “No proposals yet.”
        </p>
      </div>
    </Shell>
  );
};

const EmptyStateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.92, 1.04]);
  return (
    <Shell label="SYMPTOM 01">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 54, alignItems: 'center', height: '78%'}}>
        <div>
          <h2 style={{fontFamily: FONT_SANS, color: COLORS.white, fontSize: 70, margin: 0}}>The page looked empty.</h2>
          <p style={{fontFamily: FONT_SANS, color: COLORS.gray, fontSize: 34, lineHeight: 1.35}}>But devnet returned real accounts. The empty state was hiding a failed read path.</p>
        </div>
        <div style={{background: COLORS.panel2, borderRadius: 26, padding: 44, transform: `scale(${pulse})`, border: `1px solid ${COLORS.dim}`}}>
          <div style={{fontFamily: FONT_SANS, color: COLORS.white, fontSize: 44, marginBottom: 18}}>No proposals yet</div>
          <div style={{fontFamily: FONT_MONO, color: COLORS.gray, fontSize: 28}}>create one to get started</div>
        </div>
      </div>
    </Shell>
  );
};

const DebugTraceScene: React.FC = () => (
  <Shell label="TRACE">
    <h2 style={{fontFamily: FONT_SANS, color: COLORS.white, fontSize: 64, margin: '0 0 34px'}}>The useful log was the one I didn’t have at first.</h2>
    <CodeBlock lines={[
      'rpc_done:      15 accounts ✅',
      'filter_done:   11 Proposal accounts ✅',
      'decode_error:  Account not found: Proposal ❌',
      '',
      'React was not the bug.',
      'The decode layer was.'
    ]} />
  </Shell>
);

const ByteLayoutScene: React.FC = () => {
  const frame = useCurrentFrame();
  const items = ['8-byte discriminator', 'creator Pubkey', 'proposal_id u64', 'title String', 'state enum', 'yes/no votes', 'bump'];
  return (
    <Shell label="BYTES">
      <h2 style={{fontFamily: FONT_SANS, color: COLORS.white, fontSize: 64, margin: '0 0 40px'}}>Final fix: decode the account layout directly.</h2>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 18}}>
        {items.map((item, i) => {
          const opacity = interpolate(frame, [i * 8, i * 8 + 12], [0, 1], clamp);
          const x = interpolate(frame, [i * 8, i * 8 + 12], [-30, 0], clamp);
          return <div key={item} style={{opacity, transform: `translateX(${x}px)`, padding: '22px 28px', borderRadius: 16, background: COLORS.panel, border: `1px solid ${i === 4 ? COLORS.yellow : COLORS.dim}`, color: i === 4 ? COLORS.yellow : COLORS.white, fontFamily: FONT_MONO, fontSize: 28}}>{item}</div>;
        })}
      </div>
    </Shell>
  );
};

const EnumScene: React.FC = () => (
  <Shell label="STATE BUG">
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 42, alignItems: 'start'}}>
      <div>
        <h2 style={{fontFamily: FONT_SANS, color: COLORS.white, fontSize: 62, marginTop: 0}}>Then `NotDraft` was the clue.</h2>
        <p style={{fontFamily: FONT_SANS, color: COLORS.gray, fontSize: 34, lineHeight: 1.35}}>The program rejected Activate because the proposal was already Active. The frontend had decoded the enum shape wrong.</p>
      </div>
      <CodeBlock color={COLORS.yellow} lines={[
        '// wrong shape',
        '{ active: {} }',
        '',
        '// UI check',
        'state.draft !== null',
        '',
        '// undefined !== null → true'
      ]} />
    </div>
  </Shell>
);

const CorrectShapeScene: React.FC = () => (
  <Shell label="FIX">
    <h2 style={{fontFamily: FONT_SANS, color: COLORS.white, fontSize: 62, margin: '0 0 34px'}}>The UI needed Anchor’s nullable enum shape.</h2>
    <CodeBlock lines={[
      'const state = {',
      '  draft:  stateByte === 0 ? {} : null,',
      '  active: stateByte === 1 ? {} : null,',
      '  closed: stateByte === 2 ? {} : null,',
      '}'
    ]} />
  </Shell>
);

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin(frame / 10), [-1, 1], [0.35, 0.8]);
  return (
    <Shell label="LESSON">
      <div style={{height: '76%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <h2 style={{fontFamily: FONT_SANS, color: COLORS.white, fontSize: 78, lineHeight: 1.08, maxWidth: 1300, margin: 0}}>
          Solana frontends are only as honest as their account decoder.
        </h2>
        <div style={{marginTop: 54, display: 'flex', gap: 22, alignItems: 'center', fontFamily: FONT_MONO, fontSize: 30, color: COLORS.gray}}>
          <span>RPC</span><span style={{color: COLORS.green}}>→</span><span>discriminator</span><span style={{color: COLORS.green}}>→</span><span>Borsh</span><span style={{color: COLORS.green}}>→</span><span>enum shape</span><span style={{color: COLORS.green}}>→</span><span>UI</span>
        </div>
        <div style={{marginTop: 42, height: 4, width: 900, background: `linear-gradient(90deg, rgba(20,241,149,${glow}), rgba(153,69,255,${glow}))`}} />
      </div>
    </Shell>
  );
};

export const ProposalDebuggingVideo: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={70}><TitleScene /></Series.Sequence>
    <Series.Sequence durationInFrames={70}><EmptyStateScene /></Series.Sequence>
    <Series.Sequence durationInFrames={80}><DebugTraceScene /></Series.Sequence>
    <Series.Sequence durationInFrames={80}><ByteLayoutScene /></Series.Sequence>
    <Series.Sequence durationInFrames={80}><EnumScene /></Series.Sequence>
    <Series.Sequence durationInFrames={70}><CorrectShapeScene /></Series.Sequence>
    <Series.Sequence durationInFrames={90}><TakeawayScene /></Series.Sequence>
  </Series>
);
