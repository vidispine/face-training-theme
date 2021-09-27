import React from 'react';
import { Upload } from '@vidispine/vdt-materialui';
import { UploadContext } from '../Context';
import UploadForm from './UploadForm';

export default function ItemUpload() {
  const { useUploadFiles, contextFiles, setContextFiles } = React.useContext(UploadContext);

  return (
    <Upload
      useUploadFiles={useUploadFiles}
      contextFiles={contextFiles}
      setContextFiles={setContextFiles}
      UploadEditorProps={{ UploadFormComponent: UploadForm }}
    />
  );
}
