import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import { APP_TITLE } from './const';

export default function HeaderTitle({ subheader, IconComponent = DeviceHubIcon }) {
  const { t } = useTranslation();
  return (
    <Grid container alignItems="center">
      <Box pr={2}>
        <IconComponent color="inherit" />
      </Box>
      <Box>
        <Typography variant="h6" color="inherit">
          {APP_TITLE || t('appTitle')}
        </Typography>
        {subheader && (
          <Typography variant="subtitle2" color="inherit">
            {subheader}
          </Typography>
        )}
      </Box>
    </Grid>
  );
}
