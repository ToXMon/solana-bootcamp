import React from 'react';
import { Composition } from 'remotion';
import { FirstTokenVideo } from './FirstTokenVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="first-token-video"
        component={FirstTokenVideo}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
