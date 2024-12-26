import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
// material-ui
import { Box, CircularProgress, Tab, Tabs } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Book, DocumentText, TableDocument, WalletMoney } from 'iconsax-react';
import Transaction from 'sections/cabprovidor/profile/profileOverview/Transaction';
import Statement from 'sections/cabprovidor/profile/profileOverview/Statement';
import Mails from 'sections/cabprovidor/profile/profileOverview/Mails';
import Overview from 'sections/cabprovidor/profile/profileOverview/Overview';
import axios from 'axios';
import axiosServices from 'utils/axios';

const ProfileOverview = () => {

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [profileBasicData, setProfileBasicData] = useState('null');
  const [profileSpecificData, setProfileSpecificData] = useState('null');
  const token = localStorage.getItem('serviceToken');

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Utility function to generate random date
  const getRandomDate = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toLocaleDateString(); // Format the date as needed
  };

  // Utility function to generate random invoice number
  const getRandomInvoiceNumber = () => {
    return `INV-${Math.floor(Math.random() * 1000000)}`;
  };

  // Utility function to generate random amount
  const getRandomAmount = () => {
    return (Math.random() * 1000).toFixed(2); // Random amount between 0 and 1000
  };

  // Utility function to generate random balance due
  const getRandomBalanceDue = () => {
    return (Math.random() * 500).toFixed(2); // Random balance due between 0 and 500
  };

  // Function to generate random data for the table
  const generateRandomTransactions = (num) => {
    return Array.from({ length: num }, (_, index) => ({
      id: index + 1,
      startDate: getRandomDate(),
      invoiceNumber: getRandomInvoiceNumber(),
      amount: getRandomAmount(),
      balanceDue: getRandomBalanceDue(),
      status: Math.random() > 0.5 ? 'Active' : 'Inactive' // Randomly assign status
    }));
  };

  // Usage in your Transaction component
  const data = generateRandomTransactions(10);

  useEffect(() => {
    async function fetchProfileDetails() {
      const response = await axiosServices.get(`/user/view`);

      if (response.status === 200) {
        setProfileBasicData(response.data.userData);
        setProfileSpecificData(response.data.userSpecificData);
        setLoading(false);
      }
    }

    fetchProfileDetails();
  }, []);

  return (
    <>
      {loading ? (
        <Box
          sx={{
            height: '100vh',
            width: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <MainCard border={false}>
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleChange}
              aria-label="Profile Tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Overview" icon={<Book />} iconPosition="start" />
              {/* <Tab label="Transaction" icon={<WalletMoney />} iconPosition="start" />
              <Tab label="Mails" icon={<TableDocument />} iconPosition="start" />
              <Tab label="Statement" icon={<DocumentText />} iconPosition="start" /> */}
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && <Overview profileBasicData={profileBasicData} profileSpecificData={profileSpecificData}/>}
              {/* {activeTab === 1 && <Transaction data={data} />}
              {activeTab === 2 && <Mails/>}
              {activeTab === 3 && <Statement/>} */}
            </Box>
          </Box>
          <Box sx={{ mt: 2.5 }}>
            <Outlet />
          </Box>
        </MainCard>
      )}
    </>
  );
};

export default ProfileOverview;
