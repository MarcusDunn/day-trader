import * as React from 'react';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';

export default function Copyright() {
  return (
    <Typography className="my-8" variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <MuiLink color="inherit" href="https://github.com/MarcusDunn/day-trader">
        '; DROP TABLE STUDENTS;'
      </MuiLink>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
}
