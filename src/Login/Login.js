import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { LoginForm } from '@vidispine/vdt-materialui';
import { useTranslation } from 'react-i18next';

const SERVER_URL_PARAM = 'to';
const params = new URLSearchParams(window.location.search);
const defaultServerUrl = params.get(SERVER_URL_PARAM) || '';

export default function Login({
  onLogin,
  userName,
  serverUrl = defaultServerUrl,
  onBack,
  AppTitleComponent,
}) {
  const { t } = useTranslation();
  return (
    <Container maxWidth="sm">
      <div style={{ height: '30vh' }} />
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        direction="row"
        style={{ width: '100%' }}
      >
        <Grid item>
          <AppTitleComponent subheader={serverUrl} />
        </Grid>
        {onBack && (
          <Grid item>
            <Button onClick={onBack} size="small" variant="outlined">
              {t('Back To Server List')}
            </Button>
          </Grid>
        )}
      </Grid>
      <LoginForm
        onSubmit={onLogin}
        FormProps={{
          initialValues: { userName, serverUrl },
        }}
        FormFieldsProps={{
          UrlFieldComponent: serverUrl ? null : undefined,
          RememberMeFieldComponent: null,
        }}
        FormButtonsProps={{
          SubmitButtonProps: { variant: 'outlined', color: 'primary' },
        }}
      />
    </Container>
  );
}
