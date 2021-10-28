import React from 'react';
import { useUploadFiles } from '@vidispine/vdt-react';
import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE } from '../const';

export const UploadContext = React.createContext();

export const UploadProvider = ({ children, uploadProps }) => {
  const [uploadType, setUploadType] = React.useState(null);

  const {
    onAddFiles: contentOnAddFiles,
    onChangeMetadata: contentOnChangeMetadata,
    onUpload: contentOnUpload,
    onRemoveFiles: contentOnRemoveFiles,
    onRemoveFile: contentOnRemoveFile,
    files: contentFiles,
  } = useUploadFiles({
    ...uploadProps,
    initialMetadata: {
      [TRAINING_METADATA_KEY]: false,
    },
  });

  const {
    onAddFiles: trainingOnAddFiles,
    onChangeMetadata: trainingOnChangeMetadata,
    onUpload: trainingOnUpload,
    onRemoveFiles: trainingOnRemoveFiles,
    onRemoveFile: trainingOnRemoveFile,
    files: trainingFiles,
  } = useUploadFiles({
    ...uploadProps,
    initialMetadata: {
      [TRAINING_METADATA_KEY]: true,
      [TRAINING_METADATA_VALUE]: '',
    },
  });

  const onAddContent = (props) =>
    new Promise((resolve) => {
      contentOnAddFiles(props);
      resolve();
    }).then(() => {
      const firstListItem = document.querySelector('.MuiListItem-root');
      firstListItem.click();
    });

  const onAddTraining = (props) =>
    new Promise((resolve) => {
      trainingOnAddFiles(props);
      resolve();
    }).then(() => {
      const firstListItem = document.querySelector('.MuiListItem-root');
      firstListItem.click();
    });

  const contextUseContentUploadFiles = () => ({
    onAddFiles: onAddContent,
    onChangeMetadata: contentOnChangeMetadata,
    onUpload: contentOnUpload,
    onRemoveFiles: contentOnRemoveFiles,
    onRemoveFile: contentOnRemoveFile,
    files: contentFiles,
  });
  const contextUseTrainingUploadFiles = () => ({
    onAddFiles: onAddTraining,
    onChangeMetadata: trainingOnChangeMetadata,
    onUpload: trainingOnUpload,
    onRemoveFiles: trainingOnRemoveFiles,
    onRemoveFile: trainingOnRemoveFile,
    files: trainingFiles,
  });

  return (
    <UploadContext.Provider
      value={{
        useContentUploadFiles: contextUseContentUploadFiles,
        useTrainingUploadFiles: contextUseTrainingUploadFiles,
        uploadType,
        setUploadType,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};
