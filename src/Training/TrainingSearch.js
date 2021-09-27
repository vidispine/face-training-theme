import React from 'react';
import debounce from 'lodash.debounce';

import { Box, Grid, Button, Collapse } from '@material-ui/core';
import { job as JobApi } from '@vidispine/vdt-api';
import { useAutocomplete } from '@vidispine/vdt-react';
import { ItemGrid, Pagination, SearchInput, SearchSuggestions } from '@vidispine/vdt-materialui';

import { useSnackbar, useDialog } from '../Context';
import TrainingCard from './TrainingCard';
import TrainingDrawer from './TrainingDrawer';
import AddToCollectionDialog from './Dialogs/AddToCollectionDialog';
import MergeDialog from './Dialogs/MergeDialog';
import RenameResourceDialog from './Dialogs/RenameResourceDialog';
import { TRAINING_METADATA_VALUE } from '../const';

import { TrainingFilter } from './TrainingFilter';
import { mergeItems, deleteItem } from './utils';

const ERROR_STATES = ['FAILED_TOTAL', 'ABORTED'];
const SUCCESSFUL_STATES = ['FINISHED', 'FINISHED_WARNING'];

export default ({ itemListType, onRefresh, state }) => {
  const { showDialog } = useDialog();
  const { setNotification } = useSnackbar();
  const {
    state: { page, searchText = '', rowsPerPage, itemSearchDocument } = {},
    onChangePage,
    setSearchText,
    onChangeRowsPerPage,
    setItemSearchDocument,
  } = state;
  const { item: itemList = [], hits = 0, isLoading } = itemListType;

  const { suggestions, setAutocompleteText } = useAutocomplete({ field: TRAINING_METADATA_VALUE });
  const debouncedSetAutocompleteText = React.useRef(debounce(setAutocompleteText, 200)).current;
  React.useEffect(() => debouncedSetAutocompleteText(searchText), [
    searchText,
    debouncedSetAutocompleteText,
  ]);

  const success = React.useCallback(() => setNotification({ open: true, message: 'Success!' }), [
    setNotification,
  ]);
  const failed = React.useCallback(
    (err) => {
      if (!err) return;
      const { message } = err;
      if (!message) return;
      setNotification({ open: true, message, severity: 'error' });
    },
    [setNotification],
  );
  const pollJob = React.useCallback(
    ({ data: { jobId } = {} }) => {
      const poll = async () => {
        const { data = {} } = await JobApi.getJob({ jobId: 'VX-121' });
        const { status } = data;
        if (SUCCESSFUL_STATES.includes(status)) {
          success();
          onRefresh();
        } else if (ERROR_STATES.includes(status)) {
          failed(new Error('Job failed'));
        } else setTimeout(poll, 250);
      };
      if (jobId) poll();
      else failed(new Error('Failed to start job'));
    },
    [onRefresh, success, failed],
  );

  const [item, setItem] = React.useState(undefined);
  const [drawer, setDrawer] = React.useState(undefined);
  const onClick = (i) => setDrawer(i);
  const onOpen = (i) => setItem(i);
  const onMerge = () => showDialog({ Dialog: MergeDialog, item }).then(pollJob).catch(failed);
  const onRename = () =>
    showDialog({ Dialog: RenameResourceDialog, item }).then(pollJob).catch(failed);
  const onAddToCollection = () =>
    showDialog({ Dialog: AddToCollectionDialog, item }).then(success).catch(failed).then(onRefresh);
  const onDrop = ({ dragInfo }) =>
    showDialog({
      title: 'Merge resources',
      message: 'Are you sure you would like to merge these resources?',
      okText: 'Yes, merge items',
      noText: 'No, cancel',
    })
      .then(() => mergeItems(dragInfo.entityId, drawer.itemId).then(pollJob).catch(failed))
      .catch(failed);
  const onDelete = () =>
    showDialog({
      title: 'Delete resource',
      message: 'Are you sure you would like to delete this resource?',
      okText: 'Yes, delete item',
      noText: 'No, cancel',
    })
      .then(() => deleteItem(item.itemId).then(success).catch(failed))
      .catch(failed)
      .then(onRefresh);

  const [expanded, setExpanded] = React.useState(true);
  return (
    <Box display="flex">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box height={50} display="flex" alignItems="center">
            <SearchInput
              submitting={isLoading}
              searchPlaceholder="Search faces..."
              InputBaseProps={{ style: { flexGrow: 1 } }}
              value={searchText}
              onChange={setSearchText}
              SuggestionsComponent={SearchSuggestions}
              SuggestionsProps={{ suggestions }}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ flexShrink: 0, marginLeft: 16 }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide' : 'Show'} filter
            </Button>
            <Pagination
              page={page}
              count={hits}
              rowsPerPage={rowsPerPage}
              onChangePage={onChangePage}
              onChangeRowsPerPage={onChangeRowsPerPage}
              TablePaginationProps={{
                style: { flexShrink: 0 },
                labelRowsPerPage: 'Items per page',
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={expanded}>
            <TrainingFilter filter={itemSearchDocument} setFilter={setItemSearchDocument} />
          </Collapse>
          <ItemGrid
            itemList={itemList}
            itemListType={itemListType}
            GridContainerProps={{ spacing: 2 }}
            ItemCardProps={{
              MediaCardComponent: TrainingCard,
              onOpen,
              onClick,
              onMerge,
              onDelete,
              onRename,
              onAddToCollection,
              titleSelector: ({ title, filename }) => title || filename,
              contentSelector: ({ parentId }) => parentId,
              subheaderSelector: ({ created }) => created,
              avatarSelector: ({ method }) => method,
            }}
          />
        </Grid>
      </Grid>
      <TrainingDrawer open={Boolean(drawer)} item={drawer} onClose={setDrawer} onDrop={onDrop} />
    </Box>
  );
};
