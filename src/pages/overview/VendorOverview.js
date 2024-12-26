import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
// material-ui
import { Box, CircularProgress, Tab, Tabs } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Bill, Book, Buliding, DocumentText, EmptyWallet, Routing2, TableDocument, WalletMoney } from 'iconsax-react';
import Transaction from 'sections/cabprovidor/vendorManagement/vendorOverview/Transaction';
import Mails from 'sections/cabprovidor/vendorManagement/vendorOverview/Mails';
import Statement from 'sections/cabprovidor/vendorManagement/vendorOverview/Statement';
import axios from 'axios';
import Overview from 'sections/cabprovidor/vendorManagement/vendorOverview/overview';
import Loan from 'sections/cabprovidor/vendorManagement/vendorOverview/loan';
import AttachedCompany from 'sections/cabprovidor/vendorManagement/vendorOverview/AttachedCompany';
import axiosServices from 'utils/axios';
import { APP_DEFAULT_PATH } from 'config';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import TripDetail from 'sections/cabprovidor/vendorManagement/vendorOverview/TripDetails';
import AdvanceVendor from 'sections/cabprovidor/vendorManagement/vendorOverview/AdvanceVendor';
import { USERTYPE } from 'constant';
import { useSelector } from 'store';

const tabConfig = [
  { label: 'Overview', icon: <Book />, access: [USERTYPE.iscabProvider] },
  { label: 'Trips', icon: <Routing2 />, access: [USERTYPE.iscabProvider] },
  { label: 'Advance', icon: <TableDocument />, access: [USERTYPE.iscabProvider] },
  { label: 'Invoice', icon: <Bill />, access: [USERTYPE.iscabProvider] },
  { label: 'Attached Companies', icon: <Buliding />, access: [USERTYPE.iscabProvider] }
];

const VendorOverview = () => {
  const { id } = useParams(); // used to extract companyId to fetch company Data
  const vendorId = id;

  const [activeTab, setActiveTab] = useState(0);
  const [vendorDetail, setVendorDetail] = useState(null);
  const [vendorSpecificDetail, setVendorSpecificDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const vendorCompanyName = vendorSpecificDetail?.vendorCompanyName;

  const { userType } = useSelector((state) => state.auth);

  //  useEffect: Get vendor's details by vendorId

  useEffect(() => {
    if (vendorId) {
      const fetchVendorData = async () => {
        const token = localStorage.getItem('serviceToken');
        try {
          const response = await axiosServices.get(`/vendor/details/by?vendorId=${vendorId}`);

          if (response.status === 200) {
            setVendorDetail(response.data.userData);
            setVendorSpecificDetail(response.data.userSpecificData);
            setLoading(false);
          }

          // Handle the response as needed
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      };

      fetchVendorData();
    }
  }, [vendorId]);

  let breadcrumbLinks = [
    { title: 'Home', to: APP_DEFAULT_PATH },
    { title: 'Vendor', to: '/management/vendor/view' },
    { title: `${vendorCompanyName}` }
  ];

  //  useEffect: Fetch assigned companies to a vendor by vendor Id

  // useEffect(() => {
  //   if (vendorId) {
  //     const fetchCompanyData = async () => {
  //       try {
  //         const response = await axiosServices.get(`/vendor/companies?vendorId=${vendorId}`);

  //         if (response.status === 200) {
  //           setVendorData(response.data.data);
  //           setLoading(false);
  //         }

  //         // Handle the response as needed
  //       } catch (error) {
  //         console.error('Error fetching company data:', error);
  //       }
  //     };

  //     fetchCompanyData();
  //   }
  // }, [vendorId]);

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

  // Function to generate a random vehicle
  const getRandomVehicle = () => {
    const vehicles = ['Car', 'Truck', 'Bike', 'Bus', 'Van'];
    return vehicles[Math.floor(Math.random() * vehicles.length)];
  };

  // Function to generate random advance rate
  const getRandomAdvanceRate = () => {
    return `${Math.floor(Math.random() * 20) + 1}%`; // Random advance rate between 1% and 20%
  };

  // Function to generate random description
  const getRandomDescription = () => {
    return `Installment ${Math.floor(Math.random() * 52) + 1}`; // Random installment between 1 and 52
  };

  // Function to generate random company names
  const getRandomCompanyName = () => {
    const companies = [
      'ABC Corp',
      'Global Tech',
      'Innovative Solutions',
      'Bright Future',
      'Tech Wizards',
      'NextGen Industries',
      'BlueSky Ventures',
      'Dynamic Group'
    ];
    return companies[Math.floor(Math.random() * companies.length)];
  };

  // Function to generate random data for the table
  const generateRandomTransactions = (num) => {
    return Array.from({ length: num }, (_, index) => ({
      id: index + 1,
      startDate: getRandomDate(),
      invoiceNumber: getRandomInvoiceNumber(),
      amount: getRandomAmount(),
      balanceDue: getRandomBalanceDue(),
      status: Math.random() > 0.5 ? 'Active' : 'Inactive',
      vehicle: getRandomVehicle(),
      advanceRate: getRandomAdvanceRate(),
      advanceType: 'Full',
      description: getRandomDescription(),
      company_name: getRandomCompanyName(),
      totalLoanAmount: `₹${(Math.random() * 10000).toFixed(2)}`,
      totalPaid: `₹${(Math.random() * 5000).toFixed(2)}`,
      totalBalance: `₹${(Math.random() * 5000).toFixed(2)}`,
      loanTerm: `${Math.floor(Math.random() * 10) + 1} years`,
      totalWeek: Math.floor(Math.random() * 52),
      termPaid: Math.floor(Math.random() * 52),
      endDate: '2025-12-31'
    }));
  };

  // Usage in your Transaction component
  const data = generateRandomTransactions(10);

  // Filter the tabs based on userType
  const filteredTabs = tabConfig.filter((tab) => !tab.access || tab.access.includes(userType));

  return (
    <>
      <Breadcrumbs custom links={breadcrumbLinks} />
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
            <Tabs value={activeTab} onChange={handleChange} aria-label="Profile Tabs">
              {filteredTabs.map((tab, index) => (
                <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
              ))}
            </Tabs>

            <TabContent
              activeTab={activeTab}
              filteredTabs={filteredTabs}
              vendorDetail={vendorDetail}
              vendorId={vendorId}
              vendorSpecificDetail={vendorSpecificDetail}
              vendorCompanyName={vendorCompanyName}
              data={data}
            />
          </Box>
          <Box sx={{ mt: 2.5 }}>
            <Outlet />
          </Box>
        </MainCard>
      )}
    </>
  );
};

export default VendorOverview;

const TabContent = ({ activeTab, vendorDetail, vendorId, vendorSpecificDetail, vendorCompanyName, data, filteredTabs }) => {
  // Dynamic components array based on filteredTabs
  const components = {
    Overview: <Overview data={vendorDetail} data1={vendorSpecificDetail} vendorCompanyName={vendorCompanyName} />,
    Trips: <TripDetail vendorId={vendorId} />,
    Advance: <AdvanceVendor vendorId={vendorId} />,
    Invoice: <Transaction data={data} />,
    'Attached Companies': <AttachedCompany vendorId={vendorId} />
  };

  // Get the active tab label
  const activeTabLabel = filteredTabs[activeTab]?.label;

  // Render the corresponding component
  return <Box sx={{ p: 3 }}>{components[activeTabLabel]}</Box>;
};

TabContent.propTypes = {
  activeTab: PropTypes.number.isRequired,
  vendorDetail: PropTypes.object.isRequired,
  vendorId: PropTypes.string.isRequired,
  vendorSpecificDetail: PropTypes.object.isRequired,
  vendorCompanyName: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  filteredTabs: PropTypes.array.isRequired
};
