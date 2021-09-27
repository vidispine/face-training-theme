import React from 'react';
import { useSearch, GetItem } from '@vidispine/vdt-react';
import { parseMetadataType } from '@vidispine/vdt-js';
import {
  ItemSearchPicker,
  CollectionSearchPicker,
  TextField,
  MediaCardThumbnail,
} from '@vidispine/vdt-materialui';
import { PersonAdd as Create, Search, Info as InfoIcon } from '@material-ui/icons';
import {
  withStyles,
  Box,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@material-ui/core';

import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE } from '../../const';
import { moveItem, mergeItems, relabelItem } from '../utils';
import { useTraining } from '../../Context';

const ItemTableProps = {
  options: [
    { label: 'ID', value: 'itemId' },
    { label: 'Name', value: TRAINING_METADATA_VALUE },
    { label: 'Type', value: 'type' },
  ],
};

const CreateItemTab = ({ filename, setFilename, collectionId, setCollectionId }) => {
  const { trainingId } = useTraining();
  const onChange = ({ target }) => setFilename(target.value);
  const onRowClick = ({ id }) => setCollectionId(collectionId.includes(id) ? [] : [id]);
  const search = useSearch({
    queryParams: {
      field: ['collectionId', 'title'],
      content: 'metadata',
    },
    rowsPerPage: 5,
    itemSearchDocument: {
      filter: [
        {
          name: 'collectionId',
          operation: 'NOT',
          field: [
            {
              name: 'collectionId',
              value: [{ value: trainingId }],
            },
          ],
        },
      ],
    },
  });
  return (
    <>
      <Typography variant="h6">Who is this?</Typography>
      <TextField autoFocus label="Name of person" input={{ onChange, value: filename }} />
      <Box mt={1}>
        <Typography paragraph variant="subtitle2">
          * Adding this resource to a collection is optional
        </Typography>
        <CollectionSearchPicker
          CollectionTableProps={{ onRowClick, selected: collectionId }}
          searchProps={search}
          searchPlaceholder="Search collections..."
        />
      </Box>
    </>
  );
};

export const MergeTabs = ({
  itemId,
  params = {
    view: 'search',
    selected: [],
    filename: '',
    collectionId: [],
  },
  setParams = () => null,
  allowCreate = false,
}) => {
  const setView = (view) => setParams({ ...params, view });
  const onRowClick = ({ id, metadata }) => {
    const selected = [];
    const { selected: previous } = params;
    if (!previous.some(({ id: prevId }) => prevId === id)) {
      const { [TRAINING_METADATA_VALUE]: title } = parseMetadataType(metadata, {
        flat: true,
        arrayOnSingle: false,
      });
      selected.push({ title, id });
    }
    setParams({ ...params, selected });
  };
  const setFilename = (filename) => setParams({ ...params, filename });
  const setCollectionId = (collectionId) => setParams({ ...params, collectionId });

  const [SearchItemProps] = React.useState({
    itemSearchDocument: {
      filter: [
        {
          name: 'training_material',
          operation: 'AND',
          field: [
            {
              name: TRAINING_METADATA_KEY,
              value: [{ value: true }],
            },
          ],
        },
        {
          name: 'itemId',
          operation: 'NOT',
          field: [
            {
              name: 'itemId',
              value: [{ value: itemId }],
            },
          ],
        },
      ],
    },
    queryParams: {
      field: [TRAINING_METADATA_VALUE, 'itemId'],
      content: 'metadata',
    },
    rowsPerPage: 5,
  });
  return (
    <>
      <Tabs
        value={params.view}
        onChange={(e, newValue) => newValue && setView(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        style={{ marginBottom: '10px' }}
      >
        <Tab value="search" label="Search for face" icon={<Search />} />
        <Tab disabled={!allowCreate} value="create" label="Create new face" icon={<Create />} />
      </Tabs>
      {
        {
          search: (
            <ItemSearchPicker
              ItemTableProps={{
                onRowClick,
                selected: params.selected.map(({ id }) => id),
                ...ItemTableProps,
              }}
              searchProps={useSearch(SearchItemProps)}
              searchPlaceholder="Search faces..."
            />
          ),
          create: (
            <CreateItemTab
              filename={params.filename}
              setFilename={setFilename}
              collectionId={params.collectionId}
              setCollectionId={setCollectionId}
            />
          ),
        }[params.view]
      }
    </>
  );
};

const CardThumbnail = withStyles(({ palette }) => ({
  root: { backgroundColor: palette.background.default },
}))(MediaCardThumbnail);

const MergeThumbnail = ({ itemType = {} }) => <CardThumbnail innerProps={{ itemType }} />;

const MergeDialog = ({
  open,
  onClose,
  item,
  onSuccess,
  onError = () => null,
  allowCreate = false,
}) => {
  const { itemId, title, parentId } = item;
  const [params, setParams] = React.useState({
    view: 'search',
    selected: [],
    filename: '',
    collectionId: [],
  });
  const { view, selected, filename, collectionId } = params;

  const disabled = React.useMemo(() => {
    if (view === 'search') return selected.length < 1;
    if (view === 'create') return filename.length < 1;
    return true;
  }, [view, selected, filename]);

  const handleSubmit = () => {
    if (view === 'search') {
      const [{ id: target }] = params.selected;
      if (!target) return;
      mergeItems(itemId, target).then(onSuccess).catch(onError);
    }
    if (view === 'create') {
      const [targetCollectionId] = collectionId;
      moveItem(itemId, targetCollectionId, parentId)
        .then(() => relabelItem(itemId, filename).then(onSuccess).catch(onError))
        .catch(onError);
    }
  };

  const target = React.useMemo(() => {
    const [selection = {}] = params.selected;
    const { title: targetTitle, id: targetId } = selection;
    return `${targetTitle} (${targetId})`;
  }, [params.selected]);

  return (
    <Dialog open={open} fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle>Map resource ({title})</DialogTitle>
      <DialogContent dividers>
        <GetItem
          itemId={itemId}
          queryParams={{
            content: ['thumbnail'],
            'noauth-url': true,
          }}
        >
          <MergeThumbnail />
        </GetItem>
        <MergeTabs
          itemId={itemId}
          params={params}
          setParams={setParams}
          allowCreate={allowCreate}
        />
      </DialogContent>
      <DialogActions>
        <Box display="flex" alignItems="center" justifyContent="space-between" width={1}>
          <Box px={2} flexGrow={1} display="flex" alignItems="center">
            {view === 'search' && params.selected.length > 0 && (
              <>
                <InfoIcon style={{ marginRight: 8 }} />
                <Typography variant="body2">
                  This action will move the contents and references of&nbsp;
                  <Typography variant="button">{`${title} (${itemId})`}</Typography>
                  &nbsp;to&nbsp;
                  <Typography variant="button">{target}</Typography>
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <Button
          style={{ flexShrink: 0 }}
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={disabled}
        >
          {view === 'create' ? 'Create item' : 'Map resource'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergeDialog;
