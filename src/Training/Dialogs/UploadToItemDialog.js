import React from 'react';
import { Upload } from '@vidispine/vdt-materialui';
import { shape as ShapeApi } from '@vidispine/vdt-api';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { TRAINING_METADATA_KEY as shapeTag } from '../../const';

const UploadToItemDialog = ({ open, onClose, onSuccess, onError, itemId }) => {
  const onUploadFile = ({ file }) =>
    ShapeApi.createShapeImportRaw({ itemId, file, queryParams: { tag: [shapeTag] } })
      .then(onSuccess)
      .catch(onError);
  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>Add new resource</DialogTitle>
      <DialogContent dividers>
        <Upload
          uploadProps={{ onUploadFile }}
          allowUploadToCollection={false}
          UploadListItemProps={{ onClick: () => null }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadToItemDialog;
