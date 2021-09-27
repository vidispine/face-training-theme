import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { formatTimeCodeText } from '@vidispine/vdt-js';

import FaceEntry from './FaceEntry';

const findActiveTimespanIndex = ({
  faces,
  video = {},
  setActiveTimespanIndex,
  activeTimespanIndex: currentTimespanIndex,
}) => {
  const { currentTime = 0 } = video;
  const currentSeconds = Number(currentTime.toFixed(3));
  const activeTimespanIndex = faces.findIndex(({ start: startText, end: endText }) => {
    const start = formatTimeCodeText(startText);
    const end = formatTimeCodeText(endText);
    const startSeconds = Number(start.toSeconds().toFixed(3));
    const endSeconds = Number(end.toSeconds().toFixed(3));
    if (currentSeconds >= startSeconds && currentSeconds < endSeconds) {
      return true;
    }
    return false;
  });
  if (currentTimespanIndex !== activeTimespanIndex) {
    setActiveTimespanIndex(activeTimespanIndex);
  }
};

const FaceList = ({ faces = [], video, onClick = () => null }) => {
  const [activeTimespanIndex, setActiveTimespanIndex] = React.useState();
  React.useEffect(() => {
    if (video && faces.length > 0) {
      const onTimeUpdate = () =>
        findActiveTimespanIndex({
          faces,
          video,
          activeTimespanIndex,
          setActiveTimespanIndex,
        });
      video.addEventListener('timeupdate', onTimeUpdate);
      return () => {
        video.removeEventListener('timeupdate', onTimeUpdate);
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, faces]);

  const onSeek = React.useCallback(
    (seconds) => {
      if (video) {
        // eslint-disable-next-line no-param-reassign
        video.currentTime = seconds;
        if (video.played.length === 0) video.play();
      }
    },
    [video],
  );
  return (
    <Virtuoso
      style={{ height: 500 }}
      totalCount={faces.length}
      itemContent={(index) => {
        const face = faces[index];
        const isActive = activeTimespanIndex === index;
        return (
          <FaceEntry
            key={face.start + face.end}
            isActive={isActive}
            start={face.start}
            end={face.end}
            metadata={face.group}
            video={video}
            onSeek={onSeek}
            onClick={onClick}
          />
        );
      }}
    />
  );
};

export default FaceList;
