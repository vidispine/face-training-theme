import React from 'react';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { shape as ShapeApi } from '@vidispine/vdt-api';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
} from '@material-ui/core';

import { MergeTabs } from './MergeDialog';
import onUploadFile from '../../Upload/onUploadFile';
import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE } from '../../const';

export function dataURLtoFile(dataUrl, filename) {
  const byte = dataUrl.split(',').pop();
  const byteString = atob(byte);

  const buffer = new ArrayBuffer(byteString.length);
  const output = new Uint8Array(buffer);

  for (let i = 0; i < byteString.length; i += 1) {
    output[i] = byteString.charCodeAt(i);
  }
  return new File([output], filename, { type: 'image/jpeg' });
}

export function videoToImageUri(node) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const { videoWidth, videoHeight } = node;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    try {
      context.drawImage(node, 0, 0, videoWidth, videoHeight);
    } catch ({ message }) {
      reject(message);
    }
    canvas.toBlob((val) => {
      try {
        const url = URL.createObjectURL(val);
        resolve(url);
      } catch ({ message }) {
        reject(message);
      }
    });
  });
}

export function cropToImageUri(crop, ref, filename = moment().toISOString()) {
  return new Promise((resolve, reject) => {
    const { current: wrapper } = ref;
    if (!wrapper) reject(new Error('No image found'));
    const { imageRef } = wrapper;
    if (!imageRef) reject(new Error('No image found'));
    const { current } = imageRef;
    if (!current) reject(new Error('No image found'));
    const { naturalWidth, naturalHeight } = current;
    const { x: xVal, y: yVal, width, height } = crop;
    const [x, y, w, h] = [
      (xVal / 100) * naturalWidth,
      (yVal / 100) * naturalHeight,
      (width / 100) * naturalWidth,
      (height / 100) * naturalHeight,
    ];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    try {
      context.drawImage(current, x, y, w, h, 0, 0, w, h);
    } catch (e) {
      reject(e);
    }
    const data = canvas.toDataURL('image/jpeg');
    const url = dataURLtoFile(data, filename);
    resolve(url);
  });
}

const ImageCrop = ({ src, filename, onCrop }) => {
  const ref = React.createRef();
  const [crop, setCrop] = React.useState({});

  const onComplete = (px, pc) =>
    cropToImageUri(pc, ref, filename)
      .then(onCrop)
      .catch(() => null);

  return (
    <ReactCrop
      ref={ref}
      src={src}
      crop={crop}
      onChange={(e) => setCrop(e)}
      onComplete={onComplete}
      onImageLoaded={({ src: uri }) => URL.revokeObjectURL(uri)}
    />
  );
};

const defaultParams = {
  view: 'search',
  selected: [],
  filename: '',
  collectionId: [],
};

const CaptureDialog = ({ open, onClose, onSuccess, onError }) => {
  const [src, setSrc] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [params, setParams] = React.useState(defaultParams);

  React.useEffect(() => {
    if (open) videoToImageUri(document.querySelector('video')).then(setSrc);
    if (!open) URL.revokeObjectURL(src);
    // return () => {
    //   setSrc(null);
    //   setParams(defaultParams);
    //   setIsLoading(false);
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onClick = () => {
    const onProgress = () => setIsLoading(!isLoading);
    const { view, selected, filename, collectionId: target } = params;
    if (view === 'search') {
      const [{ id: itemId }] = selected;
      const queryParams = {
        tag: [TRAINING_METADATA_KEY],
        noTranscode: true,
        createThumbnails: true,
      };
      onProgress();
      return ShapeApi.createShapeImportRaw({ itemId, file, queryParams })
        .then(onSuccess)
        .catch(onError);
    }

    if (view === 'create') {
      const collectionId = target;
      const metadata = { [TRAINING_METADATA_VALUE]: filename, [TRAINING_METADATA_KEY]: true };
      return onUploadFile({ file, metadata, collectionId, onProgress })
        .then(onSuccess)
        .catch(onError);
    }
    return null;
  };

  const disabled = React.useMemo(() => {
    if (isLoading) return true;
    if (params.view === 'create') return params.filename.length < 1;
    if (params.view === 'search') return params.selected.length < 1;
    return false;
  }, [isLoading, params]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h6">Capture face</Typography>
        <Typography variant="body2">
          Make a selection by clicking and dragging the pointer over the image.
        </Typography>
        <Typography variant="body2">
          You may either add it to an existing resource or create a new face.
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {src && (
          <>
            <ImageCrop src={src} onCrop={setFile} />
            <MergeTabs allowCreate params={params} setParams={setParams} />
          </>
        )}
        {!src && <CircularProgress />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={disabled} variant="contained" color="primary" onClick={onClick}>
          Add face
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CaptureDialog;
