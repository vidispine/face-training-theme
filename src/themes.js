import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import 'typeface-roboto';

const primary = purple[500];
const primaryDark = purple[300];
const typography = {
  useNextVariants: true,
  htmlFontSize: 18,
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  subtitle2: {
    fontWeight: 600,
  },
};

const MuiButton = { root: { borderRadius: 0 } };
const MuiTableCell = { head: { fontWeight: 600 } };
const VdtQueryEntry = { queryGroup: { borderRadius: 0 } };
const overrides = { MuiButton, MuiTableCell, VdtQueryEntry };

export const light = createMuiTheme({
  typography,
  overrides,
  palette: {
    type: 'light',
    primary: {
      main: primary,
    },
    background: {
      default: '#f7f7f7',
    },
  },
});

export const dark = createMuiTheme({
  typography,
  overrides,
  palette: {
    type: 'dark',
    primary: {
      main: primaryDark,
    },
    background: {
      default: 'rgb(40, 44, 52)',
      paper: 'rgb(32, 35, 42)',
    },
  },
});

export default {
  light,
  dark,
};
