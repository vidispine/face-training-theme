import React from 'react';
import { useUploadFiles } from '@vidispine/vdt-react';
import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE } from '../const';

export const UploadContext = React.createContext();

export const UploadProvider = ({ children, uploadProps }) => {
  const [uploadType, setUploadType] = React.useState(null);
  const {
    onAddFiles: defaultOnAddFiles,
    onChangeMetadata,
    onUpload,
    onRemoveFiles,
    onRemoveFile,
    files,
  } = useUploadFiles({
    ...uploadProps,
    initialMetadata: {
      [TRAINING_METADATA_KEY]: uploadType === 'training',
      [TRAINING_METADATA_VALUE]: '',
    },
  });

  const onAddFiles = (props) =>
    new Promise((resolve) => {
      defaultOnAddFiles(props);
      resolve();
    }).then(() => {
      const firstListItem = document.querySelector('.MuiListItem-root');
      firstListItem.click();
    });

  const contextUseUploadFiles = () => ({
    onAddFiles,
    onChangeMetadata,
    onUpload,
    onRemoveFiles,
    onRemoveFile,
    files,
  });

  return (
    <UploadContext.Provider
      value={{
        useUploadFiles: contextUseUploadFiles,
        uploadType,
        setUploadType,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};
