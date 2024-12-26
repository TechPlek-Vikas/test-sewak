import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import { MODULE } from 'constant';

const permission_set = ['Create', 'Read', 'Update', 'Delete'];

// table data
function createData(moduleName, label, permissions = permission_set) {
  return {
    moduleName,
    label,
    permissions
  };
}

// const permission_set1 = ['Create', 'Read', 'Update', 'Delete'];
// const permission_set2 = ['Create', 'Read'];
// const permission_set3 = ['Update', 'Delete'];

// // table data
// const rows = [
//   createData('Dashboard', 305, permission_set),
//   createData('Loan', 305, permission_set1),
//   createData('Invoice', 452, permission_set2),
//   createData('Advance', 262, permission_set3),
//   createData('Reports', 159, permission_set1),
//   createData('Zone', 356, permission_set2)
// ];

const rows = [
  createData(MODULE.DASHBOARD, 'Dashboard'),
  createData(MODULE.ROSTER, 'Roster'),
  createData(MODULE.COMPANY, 'Company'),
  createData(MODULE.VENDOR, 'Vendor'),
  createData(MODULE.DRIVER, 'Driver'),
  createData(MODULE.CAB, 'Cab'),
  createData(MODULE.INVOICE, 'Invoice'),
  createData(MODULE.LOAN, 'Loan'),
  createData(MODULE.ADVANCE, 'Advance'),
  createData(MODULE.REPORT, 'Report'),
  createData(MODULE.ZONE, 'Zone'),
  createData(MODULE.ZONE_TYPE, 'Zone Type'),
  createData(MODULE.CAB_TYPE, 'Cab Type'),
  createData(MODULE.STATE_TAX, 'State Tax'),
  createData(MODULE.TAX_CHARGE, 'Tax Charge'),
  createData(MODULE.CAB_RATE_VENDOR, 'Vendor Cab Rate'),
  createData(MODULE.CAB_RATE_DRIVER, 'Driver Cab Rate'),
  createData(MODULE.USER_SETTING, 'User Setting'),
  createData(MODULE.INVOICE_SETTING, 'Invoice Setting'),
  createData(MODULE.LOG, 'Log')
];

console.log('rows = ', rows);

// table header
const headCells = [
  {
    id: 'moduleName',
    numeric: false,
    disablePadding: true,
    label: 'Module Name'
  },
  // {
  //   id: 'calories',
  //   numeric: true,
  //   disablePadding: false,
  //   label: 'Calories'
  // },
  {
    id: 'permissions',
    numeric: false,
    disablePadding: true,
    label: 'Permissions'
  }
];

function EnhancedTableHead({ onSelectAllClick, numSelected, rowCount }) {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" sx={{ pl: 3 }}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all modules'
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={headCell.disablePadding ? 'none' : 'normal'}>
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired
};

// ==============================|| TABLE - ENHANCED ||============================== //

export default function PermissionTable({ existedPermissions = {}, parentFunction = () => {} }) {
  const [selected, setSelected] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(existedPermissions);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.moduleName);
      const newPermissions = {};
      rows.forEach((row) => {
        newPermissions[row.moduleName] = row.permissions;
      });
      setSelected(newSelected);
      setSelectedPermissions(newPermissions);
      parentFunction(newPermissions);
    } else {
      const nonSelected = rows
        .map((n) => {
          return n.moduleName;
        })
        .reduce((acc, curr) => {
          acc[curr] = [];
          return acc;
        }, {});
      setSelected([]);
      setSelectedPermissions(nonSelected);
      parentFunction(nonSelected);
    }
  };

  const handleClick = (event, moduleName) => {
    const selectedIndex = selected.indexOf(moduleName);
    let newSelected = [];

    const newPermissions = { ...selectedPermissions };
    console.log('newPermissions = ', newPermissions);

    if (selectedIndex === -1) {
      console.log('No');
      newSelected = newSelected.concat(selected, moduleName);

      console.log(rows.find((row) => row.moduleName === moduleName).permissions);
      newPermissions[moduleName] = rows.find((row) => row.moduleName === moduleName).permissions;
    } else {
      console.log('Yes');
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      // delete newPermissions[moduleName];
      newPermissions[moduleName] = [];
    }

    console.log('newSelected = ', newSelected);
    console.log('newPermissions = ', newPermissions);

    setSelected(newSelected);
    setSelectedPermissions(newPermissions);
    parentFunction(newPermissions);
  };

  const handlePermissionChange = (event, permission, moduleName) => {
    const newPermissions = { ...selectedPermissions };

    if (event.target.checked) {
      if (!newPermissions[moduleName]) {
        newPermissions[moduleName] = [permission];
      } else if (!newPermissions[moduleName].includes(permission)) {
        newPermissions[moduleName] = [...newPermissions[moduleName], permission];
      }
    } else {
      newPermissions[moduleName] = newPermissions[moduleName].filter((p) => p !== permission);
      if (newPermissions[moduleName].length === 0) {
        // delete newPermissions[moduleName];
        newPermissions[moduleName] = [];
      }
    }

    setSelectedPermissions(newPermissions);
    parentFunction(newPermissions);

    // Auto-select or deselect the row checkbox based on permission selections
    if (newPermissions[moduleName]?.length === rows.find((row) => row.moduleName === moduleName).permissions.length) {
      if (!selected.includes(moduleName)) {
        setSelected((prev) => [...prev, moduleName]);
      }
    } else {
      setSelected((prev) => prev.filter((name) => name !== moduleName));
    }
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  useEffect(() => {
    console.log('existedPermissions', existedPermissions);

    const xPermissions = Object.fromEntries(rows.map((item) => [item.moduleName, item.permissions]));

    const output = Object.keys(existedPermissions).filter((key) => {
      const yPerms = existedPermissions[key];
      const xPerms = xPermissions[key];

      // Check if both permissions arrays exist, have the same length, and contain the same items
      return xPerms && yPerms.length === xPerms.length && yPerms.every((perm) => xPerms.includes(perm));
    });

    setSelected(output);
  }, [existedPermissions]);

  return (
    <>
      <MainCard content={false} title={`Assign Permission to Roles : ${Object.keys(existedPermissions).length === 0 ? 'Add' : 'Edit'}`}>
        {/* table */}
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead numSelected={selected.length} onSelectAllClick={handleSelectAllClick} rowCount={rows.length} />
            <TableBody>
              {rows.map((row, index) => {
                const isItemSelected = isSelected(row.moduleName);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.moduleName)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.moduleName}
                    selected={isItemSelected}
                  >
                    <TableCell sx={{ pl: 3 }} padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          fontWeight: 'bold',
                          color: isItemSelected ? 'red' : 'green'
                        }
                      }} // Add pointer cursor for better UX
                    >
                      {/* {row.moduleName } */}
                      {row.label}
                    </TableCell>
                    {/* <TableCell align="right">{row.calories}</TableCell> */}
                    <TableCell align="left">
                      <Stack spacing={1} direction="row" justifyContent="space-between">
                        {row.permissions.map((permission, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              '&:hover': {
                                // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Highlight with light red
                                transform: 'scale(2.02)' // Slight zoom effect on hover
                              },
                              '&:hover .permission-label': {
                                // color: 'red' // Change text color on hover
                                color: selectedPermissions[row.moduleName]?.includes(permission) ? 'red' : 'green' // Red if selected, green if not
                              },
                              transition: 'transform 0.3s ease, background-color 0.3s ease' // Scale animation timing
                            }}
                            onClick={(event) => event.stopPropagation()} // Prevent row selection
                          >
                            {/* <Checkbox
                              checked={selectedPermissions[row.moduleName]?.includes(permission) || false}
                              onChange={(event) => handlePermissionChange(event, permission, row.moduleName)}
                            />
                            <Typography>{permission}</Typography> */}
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedPermissions[row.moduleName]?.includes(permission) || false}
                                  onChange={(event) => handlePermissionChange(event, permission, row.moduleName)}
                                />
                              }
                              label={<Typography className="permission-label">{permission}</Typography>}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
      </MainCard>
      {/* <Typography variant="h6" sx={{ mt: 2 }}>
        Selected Permissions:
      </Typography> */}
      {/* <pre>{JSON.stringify(selectedPermissions, null, 2)}</pre> */}
    </>
  );
}

PermissionTable.propTypes = {
  existedPermissions: PropTypes.object,
  parentFunction: PropTypes.func
};

/** SUMMARY :
 * - WORKING as expected FOR ADD AND EDIT
 */
