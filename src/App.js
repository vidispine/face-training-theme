import React from 'react';
import Box from '@material-ui/core/Box';
import { Switch, Route, Redirect } from 'react-router-dom';
import { JobFooterContextProvider, DragAndDropProvider } from '@vidispine/vdt-materialui';
import { RolesProvider, BinProvider, ComposeProviders } from '@vidispine/vdt-react';
import debounce from 'lodash.debounce';

import { Header } from './Layout';
import {
  DialogProvider,
  UploadProvider,
  ResourceProvider,
  SnackbarProvider,
  TrainingProvider,
} from './Context';
import { Item } from './Item';
import { SearchItem } from './Search';
import { Upload, onUploadFile } from './Upload';
import { Training, TrainingDetails } from './Training';

import { BIN_LOCAL_STORAGE_KEY } from './const';

const onChangeBin = debounce((newValue) => {
  window.localStorage.setItem(BIN_LOCAL_STORAGE_KEY, JSON.stringify(newValue));
}, 500);

const initialBin = JSON.parse(
  window.localStorage.getItem(BIN_LOCAL_STORAGE_KEY) || JSON.stringify([]),
);

function App({ username: userName, onLogout, serverUrl, onLogin }) {
  return (
    <ComposeProviders
      providers={[
        TrainingProvider,
        { provider: ResourceProvider, resourceType: 'vidinet' },
        SnackbarProvider,
        { provider: BinProvider, initialState: initialBin, onChange: onChangeBin },
        RolesProvider,
        DragAndDropProvider,
        {
          provider: UploadProvider,
          uploadProps: {
            onUploadFile,
            chunkedUploadProps: {
              chunkSize: 200000000, // 200mb chunks
              minChunkSize: 10000000, // 10mb
              maxConcurrentTransfers: 10,
              minFileSize: 100000000, // 100MB
              maxConcurrentFileTransfers: 1,
            },
          },
        },
        DialogProvider,
      ]}
    >
      <Box height="100vh">
        <Header userName={userName} onLogout={onLogout} serverUrl={serverUrl} onLogin={onLogin} />
        <Box mb={7.5} p={2}>
          <Switch>
            <Route path="/import">
              <Upload />
            </Route>
            <Route path="/item/:itemId">
              <Item />
            </Route>
            <Route path="/item/">
              <SearchItem />
            </Route>
            <Route path="/training/:itemId">
              <TrainingDetails />
            </Route>
            <Route path="/training/">
              <Training />
            </Route>
            <Redirect from="/" push to="/item/" />
          </Switch>
        </Box>
      </Box>
      <JobFooterContextProvider />
    </ComposeProviders>
  );
}

export default App;
