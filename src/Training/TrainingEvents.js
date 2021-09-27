/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Link } from 'react-router-dom';
import { EventTimeline } from '@vidispine/vdt-materialui';
import {
  withStyles,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Avatar,
  Typography,
} from '@material-ui/core';
import { GetItem, useSearch, useSearchItem } from '@vidispine/vdt-react';
import {
  parseMetadataType,
  parseTimespan,
  formatTimeCodeText,
  findNearestThumbnail,
} from '@vidispine/vdt-js';

function buildSearchDocument(itemType) {
  const { vcs_face_externalId: value } = parseMetadataType(itemType.metadata, {
    flat: true,
    arrayOnSingle: false,
  });
  if (!value) return { queryParams: { number: 0 } };
  const itemSearchDocument = {
    filter: [
      {
        name: 'id_filter',
        operation: 'OR',
        field: [
          {
            name: 'adu_av_valueId',
            value: [{ value }],
          },
        ],
      },
    ],
    intervals: 'all',
    text: [{ value }],
  };
  const queryParams = {
    field: [
      'originalFilename',
      'durationSeconds',
      'itemId',
      'title',
      'adu_value',
      'adu_av_value',
      'adu_av_valueId',
      'adu_av_confidence',
    ],
    content: ['metadata', 'thumbnail'],
    'noauth-url': true,
    interval: 'all',
  };
  return { itemSearchDocument, queryParams };
}

const GroupConfig = [
  {
    field: ['adu_av_value', 'adu_av_valueId'],
    name: 'adu_face_DeepVAKeyframeAnalyzer',
    label: 'Recognized faces',
  },
];

const FieldConfig = [
  {
    name: 'adu_av_value',
    label: 'Name',
  },
  {
    name: 'adu_av_valueId',
    label: 'ID',
  },
];

const FaceEventEntry = withStyles(({ spacing }) => ({
  root: {
    height: spacing(4),
    width: spacing(4),
  },
}))(({ itemType, timespan, classes }) => {
  const thumbnail = findNearestThumbnail(itemType, timespan.start || 0);
  const start = formatTimeCodeText(timespan.start);
  return (
    <Tooltip title={start.toSmpte()} arrow placement="right">
      <Avatar
        classes={classes}
        component={Link}
        to={`/item/${itemType.id}?t=${start.toSeconds()}`}
        variant="rounded"
        src={thumbnail}
      />
    </Tooltip>
  );
});

const FaceEventsList = ({ itemType: trainingItem = {} }) => {
  const searchDocument = React.useMemo(() => buildSearchDocument(trainingItem), [trainingItem]);
  const { state } = useSearch(searchDocument);
  const { itemSearchDocument = {}, queryParams, matrixParams } = state;
  const { itemListType: { item = [] } = {} } = useSearchItem({
    itemSearchDocument,
    queryParams,
    matrixParams,
  });
  return (
    <List>
      {item.map((itemType, index) => {
        const [timespan] = itemType.metadata.timespan.filter(
          ({ start, end }) => start === '-INF' && end === '+INF',
        );
        const { title } = parseTimespan(timespan, { flat: true, arrayOnSingle: false });
        return (
          <ListItem key={itemType.id} divider={index + 1 !== item.length}>
            <ListItemText
              disableTypography
              primary={
                <Typography style={{ marginBottom: 30 }} variant="h6">
                  {title}
                </Typography>
              }
              secondary={
                <EventTimeline
                  key={itemType.id}
                  itemType={itemType}
                  itemSearchDocument={itemSearchDocument}
                  GroupConfig={GroupConfig}
                  FieldLabelMap={FieldConfig}
                  EventMarkerThumbnailComponent={FaceEventEntry}
                  EventContainerComponent={false}
                  EventComponent={false}
                  EventListComponent={false}
                  EventContentComponent={false}
                />
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

const queryParams = {
  content: 'metadata',
  field: 'vcs_face_externalId',
};

const Dummy = ({ isLoading, ...rest }) => {
  if (isLoading) return null;
  return <FaceEventsList {...rest} />;
};

export const FaceEventsTab = ({ itemId }) => (
  <GetItem itemId={itemId} queryParams={queryParams}>
    <Dummy />
  </GetItem>
);

export default FaceEventsTab;
