import React from 'react';
import debounce from 'lodash.debounce';

import { ItemTimespanFilter } from '@vidispine/vdt-materialui';
import { parseTimespan, sortTimespanList, parseMetadataType } from '@vidispine/vdt-js';
import { withStyles, Box, Grid, Slider, Typography } from '@material-ui/core';
import { item as ItemApi } from '@vidispine/vdt-api';

import { useSnackbar, useDialog } from '../../Context';
import MergeDialog from '../Dialogs/MergeDialog';
import FaceList from './FaceList';

import {
  ANALYSIS_MODEL_GROUP as GROUP,
  ANALYSIS_MODEL_VALUE_FIELD as VALUE,
  ANALYSIS_MODEL_CONFIDENCE_FIELD as CONFIDENCE,
  TRAINING_METADATA_EXTERNALID as EXTERNAL_ID,
  TRAINING_METADATA_VALUE,
} from '../../const';

const parseTimespans = ({ itemType }) => {
  const { metadata: metadataType, thumbnails: { uri = [] } = {} } = itemType;
  const parseOptions = {
    includeTimespanAttributes: true,
    includeGroupAttributes: true,
    flatTimespan: true,
    flatGroup: true,
    groupAsList: true,
    joinValue: ',',
  };
  const { timespan = [] } = metadataType || {};
  const sortedTimespans = timespan.sort(sortTimespanList);
  return sortedTimespans
    .map((timespanType) => parseTimespan(timespanType, parseOptions))
    .reduce((acc, curr) => {
      const { start } = curr;
      const thumbnail = uri.find((src) => src.includes(start));
      return [...acc, { ...curr, thumbnail }];
    }, []);
};

const filterFaces = (text, confidence, timespans) => {
  return timespans.filter(({ group: groupList = [] }) => {
    const { group = [] } = groupList.find(({ name }) => name === GROUP) || {};
    if (!group.length) return false;
    return group.some(({ [VALUE]: value, [CONFIDENCE]: conf }) => {
      if (!value) return conf >= confidence;
      return value.toString().toLowerCase().includes(text.toLowerCase()) && conf >= confidence;
    });
  });
};

const ConfidenceSlider = ({ onChange, confidenceText = 'Confidence' }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = React.useCallback(debounce(onChange, 500));
  const [filterConfidence, setFilterConfidence] = React.useState(50);
  const handleChange = (event, newValue) => {
    setFilterConfidence(newValue);
    debouncedOnChange(newValue / 100);
  };
  return (
    <>
      <Typography variant="caption" gutterBottom>
        {confidenceText}
      </Typography>
      <Slider
        defaultValue={50}
        valueLabelDisplay="auto"
        step={5}
        marks
        min={0}
        max={100}
        value={filterConfidence}
        onChange={handleChange}
      />
    </>
  );
};

const styles = ({ palette, spacing }) => ({
  faceList: {
    overflowY: 'scroll',
    height: '100%',
    maxHeight: 1080 / 2,
    '&::-webkit-scrollbar': {
      WebkitAppearance: 'none',
    },
    '&::-webkit-scrollbar:vertical': {
      width: 11,
    },
    '&::-webkit-scrollbar-thumb': {
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  },
  searchInput: {
    flexGrow: 1,
    paddingLeft: spacing(1),
  },
});

const FaceTable = ({ itemType, video, classes, onRefresh }) => {
  const { showDialog } = useDialog();
  const { setNotification } = useSnackbar();
  const parsedTimespans = React.useMemo(() => parseTimespans({ itemType }), [itemType]);
  const [confidence, setConfidence] = React.useState(0.5);
  const [text, setText] = React.useState('');
  const faceList = React.useMemo(() => filterFaces(text, confidence, parsedTimespans), [
    text,
    confidence,
    parsedTimespans,
  ]);

  const onMerge = (id) => {
    const queryParams = {
      content: ['metadata'],
      field: ['__collection:parentId', 'itemId', `${TRAINING_METADATA_VALUE}:title`],
    };
    const itemSearchDocument = {
      operator: { field: [{ name: EXTERNAL_ID, value: [{ value: id }] }], operation: 'OR' },
    };
    ItemApi.searchItem({ itemSearchDocument, queryParams }).then(({ data = {} }) => {
      const { item: [{ metadata }] = [{}] } = data;
      if (!metadata) return;
      const item = parseMetadataType(metadata, { flat: true, arrayOnSingle: false });
      showDialog({ Dialog: MergeDialog, allowCreate: true, item })
        .then(() => setNotification({ open: true, message: 'Success!' }))
        .catch(
          ({ message }) => message && setNotification({ open: true, message, severity: 'error' }),
        )
        .then(onRefresh);
    });
  };

  return (
    <Box>
      <Grid container alignItems="center">
        <Grid item className={classes.searchInput}>
          <ItemTimespanFilter setFilterText={setText} filterText={text} />
        </Grid>
        <Grid item style={{ flexGrow: 0.5, marginLeft: 5, marginRight: 5 }}>
          <ConfidenceSlider onChange={setConfidence} />
        </Grid>
      </Grid>
      <div className={classes.faceList}>
        <FaceList faces={faceList} video={video} onClick={onMerge} />
      </div>
    </Box>
  );
};

export default withStyles(styles)(FaceTable);
