import React from 'react';
import { collection as CollectionApi } from '@vidispine/vdt-api';
import { useSearch } from '@vidispine/vdt-react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Tabs,
  Tab,
} from '@material-ui/core';
import { CreateNewFolder as Create, Search } from '@material-ui/icons';
import { createMetadataType, parseMetadataType } from '@vidispine/vdt-js';
import { CollectionSearchPicker } from '@vidispine/vdt-materialui';

import { moveItem } from '../utils';
import { useTraining } from '../../Context';

export const onCreate = (collectionDocument) =>
  CollectionApi.createCollection({ collectionDocument });

const CreateCollection = ({ collectionDocument, setCollectionDocument }) => {
  const { title = '' } = React.useMemo(
    () => parseMetadataType(collectionDocument.metadata, { flat: true }),
    [collectionDocument],
  );
  const handleChange = React.useCallback(
    ({ target }) => {
      if (!target.value) return setCollectionDocument({});
      return setCollectionDocument({
        name: target.value,
        metadata: createMetadataType({ title: target.value, vcs_face_isSampleCollection: true }),
      });
    },
    [setCollectionDocument],
  );
  return (
    <TextField
      value={title}
      required
      autoFocus
      margin="dense"
      label="New collection"
      type="text"
      fullWidth
      onChange={handleChange}
    />
  );
};

const AddToCollectionDialog = ({
  open,
  onClose,
  item = {},
  onSuccess,
  onError = () => null,
  view: defaultView,
}) => {
  const { trainingId } = useTraining();
  const { itemId, parentId } = item;
  const [view, setView] = React.useState(defaultView || 'search');
  const [collectionDocument, setCollectionDocument] = React.useState({});
  const [collectionId, setCollectionId] = React.useState([]);
  const onRowClick = ({ id }) => setCollectionId([id]);

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

  const handleSubmit = () => {
    const [targetId] = collectionId;
    if (view === 'create')
      onCreate(collectionDocument)
        .then(({ data: { id } }) => moveItem(itemId, id, parentId).then(onSuccess).catch(onError))
        .catch(onError);
    if (view === 'search')
      moveItem(itemId, targetId, parentId).then(onSuccess).catch(onError).finally(onClose);
  };

  const disabled = React.useMemo(() => {
    if (view === 'search') return collectionId.length < 1;
    if (view === 'create') return Object.keys(collectionDocument).length < 1;
    return false;
  }, [view, collectionId, collectionDocument]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add to collection</DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={view}
          onChange={(e, newValue) => newValue && setView(newValue)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          style={{ marginBottom: '10px' }}
        >
          <Tab
            disabled={defaultView !== undefined}
            value="search"
            label="Search"
            icon={<Search />}
          />
          <Tab
            disabled={defaultView !== undefined}
            value="create"
            label="Create"
            icon={<Create />}
          />
        </Tabs>
        {
          {
            search: (
              <CollectionSearchPicker
                onChange={setCollectionId}
                CollectionTableProps={{ selected: collectionId, onRowClick }}
                searchProps={search}
              />
            ),
            create: (
              <CreateCollection
                collectionDocument={collectionDocument}
                setCollectionDocument={setCollectionDocument}
              />
            ),
          }[view]
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={disabled}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCollectionDialog;
