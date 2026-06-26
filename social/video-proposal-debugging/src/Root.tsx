import React from 'react';
import {Composition} from 'remotion';
import {ProposalDebuggingVideo} from './ProposalDebuggingVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="proposal-debugging-video"
      component={ProposalDebuggingVideo}
      durationInFrames={540}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
