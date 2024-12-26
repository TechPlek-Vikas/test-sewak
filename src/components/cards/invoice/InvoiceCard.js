import PropTypes from 'prop-types';

// material-ui
import { Box, Grid, Stack, Typography } from '@mui/material';

// assets
import { ArrowDown3, ArrowUp3 } from 'iconsax-react';

// ==============================|| INVOICE - CARD  ||============================== //

const TableWidgetCard = ({ color, title, count, percentage, isLoss, children, invoice, amount , subtitle}) => {
  return (
    <Grid container direction="row" spacing={2} justifyContent="space-between">
      <Grid item xs={12} md={5}>
        <Stack direction="column" spacing={1}>
          <Typography variant="subtitle1">{title}</Typography>

          <Stack direction="column" spacing={1}>
            <Stack direction="row" spacing={1}>
              <Typography variant="subtitle1">{count}</Typography>
              <Typography color="secondary">{subtitle ? subtitle : "invoices"}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} md={7}>
        <Box>
          <Stack direction="column" alignItems="flex-end" justifyContent="space-evenly">
            {percentage && (
              <Stack sx={{ ml: 1.25, pl: 1 }} direction="row" alignItems="center" spacing={1}>
                {!isLoss && <ArrowUp3 variant="Bold" style={{ fontSize: '0.75rem', color: `${color}` }} />}
                {isLoss && <ArrowDown3 variant="Bold" style={{ fontSize: '0.75rem', color: `${color}` }} />}
                <Typography color="secondary">{percentage}%</Typography>
              </Stack>
            )}
            <Typography variant="h5" color="inherit" sx={{ mt: 0.5 }}>
              ₹{amount}
            </Typography>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
};

TableWidgetCard.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  children: PropTypes.node,
  invoice: PropTypes.string
};

export default TableWidgetCard;
