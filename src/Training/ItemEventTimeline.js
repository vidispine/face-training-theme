import React from 'react';
import ReactDOM from 'react-dom';

import { item as ItemApi } from '@vidispine/vdt-api';
import { useApi } from '@vidispine/vdt-react';
import { parseTimespanList, formatTimeCodeText } from '@vidispine/vdt-js';

import { withStyles, Tooltip, CardHeader, Avatar } from '@material-ui/core';

const ROOT_GROUP = 'adu_face_DeepVAKeyframeAnalyzer';
const VALUE_GROUP = 'adu_av_analyzedValue';
const VALUE_FIELD = 'adu_av_value';
const CONFIDENCE_FIELD = 'adu_av_confidence';

const queryParams = {
  content: ['metadata', 'thumbnail'],
  field: [VALUE_FIELD, CONFIDENCE_FIELD, 'durationSeconds'],
  'noauth-url': true,
  group: [ROOT_GROUP, VALUE_GROUP],
};

export const EventTooltip = ({ info = {}, classes }) => {
  // add thumbnail later when there is time
  const people = React.useMemo(() => {
    const { group: groups = [] } = info;
    return groups.reduce((acc, { group }) => {
      const map = group.map(
        ({ [VALUE_FIELD]: value, [CONFIDENCE_FIELD]: confidence, group: [bbox] }) => ({
          value,
          confidence,
          bbox,
        }),
      );
      return acc.concat(map);
    }, []);
  }, [info]);
  return (
    <>
      {people.map(({ value, confidence }) => (
        <CardHeader
          className={classes.wrapper}
          key={value}
          title={value}
          subheader={confidence}
          subheaderTypographyProps={{ color: 'inherit' }}
          avatar={<Avatar className={classes.thumbnail} />}
        />
      ))}
    </>
  );
};

const Event = withStyles({
  thumbnail: {
    width: 30,
    height: 30,
  },
  wrapper: {
    padding: 8,
  },
})(EventTooltip);

const Timeline = ({ events, duration, classes, node }) => {
  const timecodes = React.useMemo(
    () =>
      events.map((event) => {
        const { start, end } = event;
        const left = (formatTimeCodeText(start).toSeconds() / duration) * 100;
        const width = (formatTimeCodeText(end).toSeconds() / duration) * 100 - left;
        return { left: `${left}%`, width: `${width}%`, ...event };
      }),
    [events, duration],
  );
  if (!node) return null;
  return ReactDOM.createPortal(
    <>
      {timecodes.map(({ left, width, ...rest }) => (
        <Tooltip
          key={left + width}
          arrow
          interactive
          placement="top-start"
          title={<Event info={rest} />}
        >
          <span className={classes.event} style={{ left, maxWidth: width }} />
        </Tooltip>
      ))}
    </>,
    node,
  );
};

export const EventTimeline = withStyles(({ palette }) => ({
  event: {
    position: 'absolute',
    top: 0,
    opacity: '0.7',
    minWidth: '5px',
    width: '5px',
    height: '100%',
    cursor: 'pointer',
    backgroundColor: palette.primary.main,
    zIndex: 10,
    transition: 'all .5s',
    '&:hover': {
      zIndex: 11,
      width: '100%',
      opacity: 1,
    },
  },
}))(Timeline);

export default function ItemEventTimeline({ itemId }) {
  const { request, data = {} } = useApi(ItemApi.getItem);

  React.useEffect(() => {
    request({ itemId, queryParams });
  }, [itemId, request]);

  const { events, duration } = React.useMemo(() => {
    const { metadata = {}, thumbnails: { uri = [] } = {} } = data;
    if (!metadata.timespan) return { events: [], duration: 0 };
    const timespans = parseTimespanList(metadata.timespan, {
      flat: true,
      groupAsList: true,
      arrayOnSingle: false,
      timespanAsList: true,
      includeTimespanAttributes: true,
    }).reduce((acc, curr) => {
      const { start, group } = curr;
      const index = acc.findIndex(({ start: s }) => s === start);
      const thumbnail = uri.find((src) => src.includes(start));
      if (index > -1) {
        const splice = acc.splice(index, 1).pop();
        const merge = splice.group.concat(group);
        return acc.concat([{ ...splice, group: merge }]);
      }
      return [...acc, { ...curr, thumbnail }];
    }, []);
    const index = timespans.findIndex(({ start }) => start === '-INF');
    const { durationSeconds } = timespans.splice(index, 1).pop();
    return { events: timespans, duration: Number(durationSeconds) };
  }, [data]);

  const [node, setNode] = React.useState(document.querySelector('.vjs-progress-holder'));
  const getProgressBar = () => {
    const doc = document.querySelector('.vjs-progress-holder');
    if (!doc) setTimeout(getProgressBar, 1000);
    else setNode(doc);
  };
  React.useEffect(getProgressBar, [getProgressBar]);

  return (
    <div style={{ width: '100%', height: 50, position: 'relative' }}>
      <EventTimeline events={events} duration={duration} node={node} />
    </div>
  );
}
