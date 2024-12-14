import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import { useTheme } from '@mui/material/styles';

export function Orders({ sx, value }) {
  const theme = useTheme();
  const color = theme.palette.custom.cardIconColor;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <h2 style={{fontWeight:'normal'}}>
            Orders
          </h2>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'center ',
              borderBottom: `4px solid ${color}`,
              paddingBottom: '2px',
              boxShadow: 'none',
            }}
            spacing={14}
          >
            <LocalGroceryStoreIcon sx={{ fontSize: '75px', color: color}} />
            <Typography variant="h5" fontSize={27} >
              {value}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}