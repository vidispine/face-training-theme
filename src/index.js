import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@vidispine/vdt-materialui';
import '@vidispine/vdt-materialui/dist/index.css';
import { useTranslation } from 'react-i18next';

import App from './App';
import { Login, ServerListRoute } from './Login';
import AppTitle from './AppTitle';
import themes from './themes';

import i18n from './i18n';
import vdtMuiLocale from './locale';
import { VIDISPINE_URL, APP_TITLE } from './const';

function Index() {
  const { t } = useTranslation();
  document.title = APP_TITLE || t('appTitle');
  return (
    <ThemeProvider themes={themes} props={vdtMuiLocale({ t, lng: i18n.language })}>
      <ServerListRoute
        AppComponent={App}
        LoginComponent={Login}
        AppTitleComponent={AppTitle}
        serverUrl={VIDISPINE_URL}
      />
    </ThemeProvider>
  );
}

ReactDOM.render(
  <Suspense fallback={null}>
    <Index />
  </Suspense>,
  document.getElementById('root'),
);
