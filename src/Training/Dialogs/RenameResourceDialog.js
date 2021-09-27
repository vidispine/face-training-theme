import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@material-ui/core';

import { relabelItem } from '../utils';

const RenameResourceDialog = ({
  item: { itemId, title: initialTitle } = {},
  open,
  onClose,
  onSuccess,
  onError = () => null,
}) => {
  const [title, setTitle] = React.useState(initialTitle);
  const handleChange = ({ target }) => setTitle(target.value);
  const disabled = React.useMemo(() => title === initialTitle, [title, initialTitle]);

  const onCreate = () => {
    if (!title) return;
    relabelItem(itemId, title).then(onSuccess).catch(onError);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rename resource</DialogTitle>
      <DialogContent dividers>
        <TextField
          value={title}
          required
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCreate} color="primary" variant="contained" disabled={disabled}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameResourceDialog;
