import React from 'react';

import { withStyles, Box, Grid, Button, Typography, CircularProgress } from '@material-ui/core';
import { Add as AddIcon, ExpandMore as ExpandIcon } from '@material-ui/icons';
import { compose, useSearch } from '@vidispine/vdt-react';
import { SearchInput, withDrop } from '@vidispine/vdt-materialui';
import useSearchCollection from './useSearchCollection';

import CollectionCard from './CollectionCard';
import CreateCollectionDialog from './Dialogs/CreateCollectionDialog';
import { useSnackbar, useDialog, useTraining } from '../Context';
import { moveItem } from './utils';

const defaultCollectionState = {
  queryParams: {
    field: ['collectionId', 'title', '__items_size:items'],
    content: 'metadata',
  },
  rowsPerPage: 5,
  itemSearchDocument: {},
};

const NewButton = compose(
  withStyles((theme) => ({
    root: {
      borderWidth: 2,
      borderStyle: 'dashed',
      width: '100%',
      transition: 'all 0.3s ease',
      borderColor: 'transparent',
    },
    canDrop: {
      borderColor: theme.palette.primary.main,
    },
    isOver: {
      backgroundColor: theme.palette.primary.main,
    },
  })),
  withDrop,
)(Button);

const CollectionSearch = ({ collectionId, setCollectionId, onRefresh: onRefreshItems }) => {
  const { showDialog } = useDialog();
  const { trainingId } = useTraining();
  const { setNotification } = useSnackbar();
  const {
    state: { itemSearchDocument, queryParams, matrixParams, rowsPerPage } = {},
    setSearchText,
    onChangeRowsPerPage,
  } = useSearch({
    ...defaultCollectionState,
    itemSearchDocument: {
      ...(trainingId && {
        operator: {
          field: [{ name: 'collectionId', value: [{ value: trainingId }] }],
          operation: 'NOT',
        },
      }),
    },
  });
  const {
    collectionListType = {},
    onRefresh: onRefreshCollections,
    isLoading,
  } = useSearchCollection({
    itemSearchDocument,
    queryParams,
    matrixParams,
  });
  const { collection: collectionList = [], hits: count = 0 } = collectionListType;

  const onRefresh = () => {
    onRefreshItems();
    onRefreshCollections();
  };

  const onLoadMore = () => onChangeRowsPerPage({ target: { value: rowsPerPage + 5 } });

  const handleOnChange = (value) => {
    const checkedValues = collectionId.filter((val) => val !== value);
    if (checkedValues.length !== collectionId.length) setCollectionId(checkedValues);
    else setCollectionId([...checkedValues, value]);
  };

  const onDrop = async ({ dragInfo, dropInfo }) => {
    const { entityId, entityParentId: source } = dragInfo;
    let { entityId: target } = dropInfo;

    if (!target) {
      target = await showDialog({ Dialog: CreateCollectionDialog });
      if (!target) return;
    }
    moveItem(entityId, target, source)
      .then(() => setNotification({ open: true, message: 'Success!' }))
      .catch(({ message }) => message && setNotification({ open: true, message: 'Success!' }))
      .then(onRefresh);
  };

  const onClick = () =>
    showDialog({ Dialog: CreateCollectionDialog })
      .then(onRefresh)
      .catch(() => null);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box height={50} display="flex" alignItems="center">
          <SearchInput
            onSubmit={setSearchText}
            searchPlaceholder="Search collections..."
            InputBaseProps={{ style: { flexGrow: 1 } }}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Filter by collection</Typography>
      </Grid>
      {collectionList.map((collectionType) => (
        <Grid key={collectionType.id} item xs={12}>
          <CollectionCard
            onDrop={onDrop}
            onClick={handleOnChange}
            checked={collectionId.includes(collectionType.id)}
            collectionType={collectionType}
          />
        </Grid>
      ))}
      {collectionList.length < count && (
        <Grid item xs={12}>
          <Button
            startIcon={isLoading ? <CircularProgress size={20} /> : <ExpandIcon fontSize="small" />}
            disabled={collectionList.length === count}
            onClick={onLoadMore}
          >
            Load more...
          </Button>
        </Grid>
      )}
      <Grid item xs={12}>
        <NewButton startIcon={<AddIcon fontSize="small" />} onClick={onClick} onDrop={onDrop}>
          Create collection
        </NewButton>
      </Grid>
    </Grid>
  );
};

export default CollectionSearch;
