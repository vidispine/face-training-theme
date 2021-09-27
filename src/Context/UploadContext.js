import React from 'react';
import { useUploadFiles } from '@vidispine/vdt-react';

export const UploadContext = React.createContext();

export const UploadProvider = ({ children, uploadProps }) => {
  const {
    onAddFiles: defaultOnAddFiles,
    onChangeMetadata,
    onUpload,
    onRemoveFiles,
    onRemoveFile,
    files,
  } = useUploadFiles(uploadProps);

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
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};
