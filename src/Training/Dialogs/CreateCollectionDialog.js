import React from 'react';
import { collection as CollectionApi } from '@vidispine/vdt-api';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@material-ui/core';
import { createMetadataType } from '@vidispine/vdt-js';

const AddToCollectionDialog = ({ open, onClose, onSuccess, onError = () => null }) => {
  const [name, setTitle] = React.useState('');
  const handleChange = ({ target }) => setTitle(target.value);
  const disabled = React.useMemo(() => name.length < 1, [name]);

  const onCreate = () => {
    if (!name) return;
    const collectionDocument = {
      name,
      metadata: createMetadataType({ title: name, vcs_face_isSampleCollection: true }),
    };
    CollectionApi.createCollection({ collectionDocument })
      .then(({ data: { id } = {} }) => onSuccess(id))
      .catch(onError);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create collection</DialogTitle>
      <DialogContent dividers>
        <TextField
          value={name}
          required
          autoFocus
          margin="dense"
          label="New collection"
          type="text"
          fullWidth
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCreate} color="primary" variant="contained" disabled={disabled}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCollectionDialog;
