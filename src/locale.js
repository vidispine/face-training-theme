import * as muiLocales from '@material-ui/core/locale';

const muiLocalesMapping = {
  en: 'enUS',
  sv: 'svSE',
  de: 'deDE',
};

export default function vdtMuiLocale({ t, lng }) {
  return {
    VdtSort: {
      caption: t('sortBy'),
    },
    VdtSearchInput: {
      searchPlaceholder: t('search'),
    },
    VdtFilterCard: {
      headerText: t('filter'),
    },
    VdtCollectionCreateDialog: {
      title: t('newCollection'),
      createText: t('create'),
      closeText: t('cancel'),
      collectionNameText: t('name'),
    },
    VdtBinListMenu: {
      emptyBinText: t('emptyBin'),
      createCollectionText: t('createCollection'),
      allowDuplicatesText: t('allowDuplicates'),
      removeText: t('removeAfterDrag'),
    },
    VdtBinList: {
      title: t('bin'),
    },
    VdtItemMetadataTab: {
      editingLabel: (isEditing) => (isEditing ? t('cancel') : t('edit')),
    },
    VdtCollectionMetadataTab: {
      editingLabel: (isEditing) => (isEditing ? t('cancel') : t('edit')),
    },
    VdtJobList: {
      jobColumnLabels: {
        jobId: t('jobId'),
        type: t('type'),
        state: t('state'),
        user: t('createdBy'),
        startTime: t('started'),
        priority: t('priority'),
        status: t('status'),
        started: t('started'),
        finished: t('finished'),
        yesterday: t('yesterday'),
        thisWeek: t('thisWeek'),
        allTime: t('allTime'),
      },
    },
    VdtJobTable: {
      jobColumnLabels: {
        type: t('type'),
        started: t('started'),
      },
    },
    VdtJobRow: {
      retryText: t('retry'),
      deleteText: t('delete'),
      startedText: t('started'),
      finishedText: t('finished'),
    },
    VdtSearchInputFieldSelect: {
      fieldPlaceHolder: t('field'),
      queryPlaceHolder: t('query'),
    },
    VdtSelectedFile: {
      fileText: t('file'),
    },
    VdtSelectedStorage: {
      storageText: t('storage'),
    },
    VdtStorageTree: {
      storageText: t('storage'),
      loadMoreText: t('loadMore'),
    },
    VdtFieldGroupDesigner: {
      onSavedText: t('hasBeenSaved'),
      selectedGroupText: t('selectedGroup'),
      availableFieldsText: t('availableFields'),
      currentFieldsText: t('currentFields'),
      editorText: t('editor'),
    },
    VdtFieldGroupEditor: {
      nameText: t('name'),
      typeText: t('type'),
      deleteText: t('delete'),
      revertText: t('revert'),
      updateText: t('update'),
      deleteFieldText: t('deleteField'),
      deleteConfirmationText: t('deleteConfirmation'),
    },
    VdtUserAvatarButton: {
      signOutText: t('signOut'),
      toggleThemeText: t('toggleTheme'),
    },
    VdtUpload: {
      UploadToCollectionButtonText: t('Upload To Collection'),
      UploadButtonDisabledText: t('uploading'),
      UploadButtonText: t('upload'),
      DragActiveText: t('dropFilesHere'),
      DragInactiveText: t('dropOrClick'),
      UploadCollectionPickerProps: {
        titleText: t('Upload To Collection'),
        submitText: t('upload'),
      },
    },
    VdtSourceSelection: {
      previewSourceText: t('previewSource'),
    },
    VdtItemFieldGroupTab: {
      editingLabel: (isEditing) => (isEditing ? t('cancel') : t('edit')),
      metadataGroupText: t('metadataGroup'),
    },
    VdtItemMetadataForm: {
      saveText: t('save'),
    },
    VdtItemTimespanFilter: {
      searchText: t('search'),
    },
    VdtItemTimespanSelection: {
      eventTypeText: t('eventType'),
    },
    VdtConfidenceSlider: {
      confidenceText: t('confidence'),
    },
    VdtItemTimespanEdit: {
      sameAsStartText: t('sameAsStart'),
      laterThanEndText: t('laterThanEnd'),
    },
    VdtItemTimespanForm: {
      startText: t('start'),
      endText: t('end'),
      textText: t('text'),
      requiredText: t('required'),
      saveText: t('save'),
      deleteText: t('delete'),
      cancelText: t('cancel'),
    },
    VdtUrlField: {
      label: t('vsApiServer'),
    },
    VdtUsernameField: {
      label: t('username'),
      requiredText: t('required'),
    },
    VdtPasswordField: {
      label: t('password'),
      requiredText: t('required'),
    },
    VdtRememberMeField: {
      label: t('rememberMe'),
    },
    VdtLoginFormButtons: {
      loginText: t('login'),
    },
    VdtQueryOperator: {
      operatorText: t('operator'),
      fieldText: t('field'),
    },
    VdtQueryField: {
      fieldText: t('field'),
      valueText: t('value'),
    },
    VdtAddToCollectionDialog: {
      titleText: t('addToCollection'),
      submitText: t('addToCollection'),
    },
    VdtCollectionSearchPicker: {
      idLabelText: t('id'),
      titleLabelText: t('title'),
      ownerLabelText: t('owner'),
      searchPlaceholder: t('searchCollections'),
    },
    VdtEntityAccessEdit: {
      permissionText: t('permission'),
      recipientTypeText: t('recipientType'),
      grantAccessText: t('grantAccess'),
      userText: t('user'),
      groupText: t('group'),
      searchText: t('search'),
    },
    VdtCollectionAccessTab: {
      toggleAddLabelText: (isAdding) => (isAdding ? t('cancel') : t('grantAccess')),
    },
    VdtItemAccessTab: {
      toggleAddLabelText: (isAdding) => (isAdding ? t('cancel') : t('grantAccess')),
    },
    VdtSavedSearchRow: {
      editTitleText: t('edit'),
      shareText: t('share'),
      listAccessText: t('access'),
      deleteText: t('delete'),
    },
    VdtSavedSearchList: {
      searchPlaceholderText: t('findSearches'),
    },
    VdtSaveSearchForm: {
      nameText: t('newSavedSearch'),
      saveText: t('save'),
    },
    VdtCreateCollection: {
      collectionNameText: t('newCollection'),
    },
    VdtSpellCheck: {
      didYouMeanText: t('didYouMean'),
    },
    VdtItemMetadataFieldRow: {
      labelText: (fieldName, label) => t(fieldName, label),
    },
    ...muiLocales[muiLocalesMapping[lng]].props,
  };
}
