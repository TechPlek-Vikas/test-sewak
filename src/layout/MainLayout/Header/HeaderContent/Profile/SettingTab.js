import { useState } from 'react';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import { Bill, Setting2 } from 'iconsax-react';
import { useNavigate } from 'react-router';
import { MdManageAccounts } from 'react-icons/md';
import { CiSettings } from 'react-icons/ci';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

const SettingTab = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (event, index, navigationCallback) => {
    setSelectedIndex(index);
    if (navigationCallback) navigationCallback();
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={(event) => handleListItemClick(event, 0, () => navigate('/settings/account'))}
      >
        <ListItemIcon>
          <MdManageAccounts variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Account Setting" />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event) => handleListItemClick(event, 1, () => navigate('/management/user/view'))}
      >
        <ListItemIcon>
          <Setting2 variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="User Setting" />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 2}
        onClick={(event) => handleListItemClick(event, 2, () => navigate('/settings/invoice'))}
      >
        <ListItemIcon>
          <Bill variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Invoice Setting" />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 3}
        onClick={(event) => handleListItemClick(event, 3, () => navigate('/settings/roster/create-template'))}
      >
        <ListItemIcon>
          <CiSettings variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Roster Setting" />
      </ListItemButton>
    </List>
  );
};

export default SettingTab;
