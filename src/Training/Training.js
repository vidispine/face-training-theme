import React from 'react';
import { Grid, CircularProgress } from '@material-ui/core';
import { useSearch, useSearchItem } from '@vidispine/vdt-react';

import { useTraining } from '../Context';
import CollectionSearch from './CollectionSearch';
import TrainingSearch from './TrainingSearch';
import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE, TRAINING_METADATA_METHOD } from '../const';

const defaultItemState = {
  itemSearchDocument: {
    filter: [
      {
        name: 'training_material',
        operation: 'AND',
        field: [
          {
            name: TRAINING_METADATA_KEY,
            value: [
              {
                value: true,
              },
            ],
          },
        ],
      },
    ],
  },
  queryParams: {
    field: [
      `${TRAINING_METADATA_VALUE}:title`,
      `${TRAINING_METADATA_METHOD}:method`,
      'created',
      // `${TRAINING_METADATA_TYPE}:created`,
      'originalFilename:filename',
      'title:backupTitle',
      '__collection:parentId',
    ],
    content: ['metadata', 'thumbnail'],
    methodMetadata: [{ key: 'format', value: 'SIGNED-AUTO' }],
    'noauth-url': true,
  },
  rowsPerPage: 10,
};

export const Training = () => {
  const [collectionId, setCollectionId] = React.useState([]);
  const { state, ...params } = useSearch(defaultItemState);
  const { itemSearchDocument } = state;
  const { itemListType = {}, onRefresh } = useSearchItem(state);

  React.useEffect(() => {
    const { onChangePage, setSearchText, setItemSearchDocument } = params;
    const value = collectionId.map((v) => ({ value: v }));
    onChangePage({ page: 0 });
    setSearchText('');
    if (!value.length) {
      setItemSearchDocument({ ...itemSearchDocument, operator: undefined });
    } else {
      setItemSearchDocument({
        ...itemSearchDocument,
        operator: {
          field: [
            { name: '__parent_collection', value },
            { name: '__collection', value },
          ],
          operation: 'OR',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);
  return (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid item xs={12} sm={12} md={4} lg={3} xl={2}>
        <CollectionSearch
          collectionId={collectionId}
          setCollectionId={setCollectionId}
          onRefresh={onRefresh}
        />
      </Grid>
      <Grid container item xs={12} sm={12} md={8} lg={9} xl={10}>
        <TrainingSearch
          itemListType={itemListType}
          onRefresh={onRefresh}
          state={{ state, ...params }}
        />
      </Grid>
    </Grid>
  );
};

const TrainingWrapper = () => {
  const { isLoading } = useTraining();
  if (isLoading) return <CircularProgress />;
  return <Training />;
};

export default TrainingWrapper;
