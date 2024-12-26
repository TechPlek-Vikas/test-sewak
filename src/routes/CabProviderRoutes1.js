/ eslint-disable no-unused-vars /;
import { lazy } from 'react';

// project-imports
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

// import RosterDashboard from 'pages/apps/test/dashboard';
import DriverRate from 'pages/management/driver/driverRate/DriverRate';
import VendorRatelisting from 'pages/management/vendor/vendorRate/VendorRatelisting';
import TripView from 'pages/trips/TripView';
import ExpandingDetails from 'sections/cabprovidor/testAdvance/ExpandingDetails';
import ReportDriver from 'pages/reports/ReportDriver';
// import Create from 'pages/invoice/create/Create3';
import TripReports from 'pages/reports/Trips';
import Create from 'pages/apps/invoice/Create';
import Home from 'pages/Home';
import Notifications from 'components/notification/Notifications';
import Details from 'pages/apps/invoice/Details';

// import Roster from 'pages/apps/roster';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));

const UnderConstruction = Loadable(lazy(() => import('components/maintenance/UnderConstruction')));

const PageNotFound = Loadable(lazy(() => import('pages/maintenance/error/404')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('pages')));
const ProfileOverview = Loadable(lazy(() => import('pages/overview/ProfileOverview')));

// Roster
const AllRosters = Loadable(lazy(() => import('pages/apps/roster')));
const RosterFileList = Loadable(lazy(() => import('pages/apps/roster/FileList')));
const UploadPreview = Loadable(lazy(() => import('pages/apps/roster/UploadPreview')));
const AssignTripList = Loadable(lazy(() => import('pages/apps/roster/AssignTripsList')));

// Invoice
const InvoiceList = Loadable(lazy(() => import('pages/invoice/list/List')));
const DriverInvoiceList = Loadable(lazy(() => import('pages/invoice/list/DriverInvoiceList')));
const VendorInvoiceList = Loadable(lazy(() => import('pages/invoice/list/VendorInvoiceList')));
const InvoiceCreate = Loadable(lazy(() => import('pages/invoice/create/Create2')));
const InvoiceDetails = Loadable(lazy(() => import('pages/invoice/details/Details')));
const InvoiceEdit = Loadable(lazy(() => import('pages/invoice/edit/Edit')));

//Trip
const TripList = Loadable(lazy(() => import('pages/trips/TripList')));

// Management
const User = Loadable(lazy(() => import('pages/management/user')));
const AddUser = Loadable(lazy(() => import('pages/management/user/AddUser')));
// Vendor
const Vendor = Loadable(lazy(() => import('pages/management/vendor')));
const AddVendor = Loadable(lazy(() => import('pages/management/vendor/AddVendor')));
const VendorOverview = Loadable(lazy(() => import('pages/overview/VendorOverview')));
const EditVendor = Loadable(lazy(() => import('pages/management/vendor/EditVendor')));

// Driver
const Driver = Loadable(lazy(() => import('pages/management/driver')));
const DriverOverview = Loadable(lazy(() => import('pages/overview/DriverOverview')));
// const AddDriver = Loadable(lazy(() => import('pages/management/driver/AddDriver')));
const EditDriver = Loadable(lazy(() => import('pages/management/driver/EditDriver.js')));

// Cab
const Cab = Loadable(lazy(() => import('pages/management/cab')));
const AddCab = Loadable(lazy(() => import('pages/management/cab/AddCab')));
const CabOverview = Loadable(lazy(() => import('pages/overview/CabOverview')));

// company
const Company = Loadable(lazy(() => import('pages/management/company')));
const AddCompany = Loadable(lazy(() => import('pages/management/company/AddCompany')));
const AddBranch = Loadable(lazy(() => import('pages/management/company/AddBranch')));
const EditBranch = Loadable(lazy(() => import('pages/management/company/EditBranch')));
const CompanyOverview = Loadable(lazy(() => import('pages/overview/CompanyOverview')));
const CompanyRateListing = Loadable(lazy(() => import('pages/management/company/addCompanyRate/CompanyRate1/CompanyRateListing')));
const EditCompany = Loadable(lazy(() => import('pages/management/company/EditCompany')));

// reports
// const Reports = Loadable(lazy(() => import('pages/reports/Reports')));
const CompanyReports = Loadable(lazy(() => import('pages/reports/Company')));
const AdvanceReports = Loadable(lazy(() => import('pages/reports/Advance')));
const CabReports = Loadable(lazy(() => import('pages/reports/Cab')));
const CompanyWiseReportForVendor = Loadable(lazy(() => import('pages/reports/Company/Vendor')));
const CabReportsForVendor = Loadable(lazy(() => import('pages/reports/Cab/Vendor')));
const AdvanceReportsForVendor = Loadable(lazy(() => import('pages/reports/Advance/Vendor')));
const CompanyWiseReportForDriver = Loadable(lazy(() => import('pages/reports/Company/Driver')));
const CabReportsForDriver = Loadable(lazy(() => import('pages/reports/Cab/Driver')));
const AdvanceReportsForDriver = Loadable(lazy(() => import('pages/reports/Advance/Driver')));

const Loans = Loadable(lazy(() => import('pages/invoices/Loans')));
const AdvanceType = Loadable(lazy(() => import('pages/invoices/advance/AdvanceType')));
// Master
const Role = Loadable(lazy(() => import('pages/master/Role')));
const Zone = Loadable(lazy(() => import('pages/master/zones')));
const ZoneType = Loadable(lazy(() => import('pages/master/zones/ZoneType')));

const CabType = Loadable(lazy(() => import('pages/master/CabType')));
// Cab Rate
const AddCabRateVendor = Loadable(lazy(() => import('pages/master/CabRate/Vendor')));
const AddCabRateDriver = Loadable(lazy(() => import('pages/master/CabRate/Driver')));

// Dashboard
const CabDashBoard = Loadable(lazy(() => import('pages/dashboard/cabDashboard/CabDashBoard')));
const DriverDashboard = Loadable(lazy(() => import('pages/dashboard/driverDashboard/DriverDashboard')));
const VendorDashboard = Loadable(lazy(() => import('pages/dashboard/vendorDashboard/VendorDashboard')));
const CompanyDashboard = Loadable(lazy(() => import('pages/dashboard/companyDashboard/CompanyDashboard')));
const UserDashboard = Loadable(lazy(() => import('pages/dashboard/userDashboard/UserDashboard')));
// Dashboard

// Settings
const InvoiceSettings = Loadable(lazy(() => import('pages/setting/invoice')));
const RosterSetting = Loadable(lazy(() => import('pages/setting/roster')));
const AccountSettings = Loadable(lazy(() => import('pages/setting/account')));

// Expense
const Transaction = Loadable(lazy(() => import('pages/expense/Transaction')));

const Temp1 = Loadable(lazy(() => import('temp1')));
// ==============================|| MAIN ROUTES ||============================== //

const CabProvidorRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        // Home
        {
          path: 'home',
          element: <Home />
        },
        // Dashboard
        {
          path: 'dashboard',
          element: <Dashboard />
        },

        {
          path: 'profile-overview',
          element: <ProfileOverview />
        },

        // Application
        {
          path: 'apps',
          children: [
            // Roster
            {
              path: 'roster',
              children: [
                {
                  path: '',
                  element: <AllRosters />
                },
                {
                  path: 'files',
                  element: <RosterFileList />
                },
                {
                  path: 'preview',
                  element: <UploadPreview />
                },
                {
                  path: 'assign-trip',
                  element: <AssignTripList />
                }
              ]
            },

            // Invoices
            {
              path: 'invoices',
              children: [
                // {
                //   path: 'dashboard',
                //   element: <InvoiceDashboard />
                // },
                {
                  path: 'company',
                  element: <InvoiceList />
                },
                {
                  path: 'vendor',
                  element: <VendorInvoiceList />
                },
                {
                  path: 'driver',
                  element: <DriverInvoiceList />
                },
                {
                  path: 'create',
                  element: <Create />
                },
                {
                  path: 'details',
                  element: <Details />
                },
                // {
                //   path: 'create',
                //   element: <InvoiceCreate />
                // },
                {
                  path: 'details/:id',
                  element: <Details />
                  // element: <InvoiceDetails />
                },
                {
                  path: 'edit/:id',
                  element: <InvoiceEdit />
                },
                {
                  path: 'loans',
                  element: <Loans />
                },
                {
                  path: 'advance',
                  element: <ExpandingDetails />
                  //   element: <ProtectedRoute element={Advance} moduleName={MODULE.ADVANCE} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'advance-type',
                  element: <AdvanceType />
                  //   element: <ProtectedRoute element={AdvanceType} moduleName={MODULE.ADVANCE_TYPE} permission={PERMISSIONS.READ} />
                }
                // {
                //   path: 'test',
                //   element: <ExpandingDetails />
                //   //   element: <ProtectedRoute element={Advance} moduleName={MODULE.ADVANCE} permission={PERMISSIONS.READ} />
                // },
              ]
            },

            // Trips
            {
              path: 'trips',
              children: [
                {
                  path: 'list',
                  element: <TripList />
                },
                {
                  path: 'trip-view/:id',
                  element: <TripView />
                }
              ]
            }
          ]
        },

        // Expenses
        {
          path: 'expense',
          children: [
            {
              path: 'transaction',
              element: <Transaction />
            }
          ]
        },

        //Notification
        {
          path: 'notification',
          element: <Notifications />
        },

        // Management
        {
          path: 'management',
          children: [
            // User
            {
              path: 'user',
              children: [
                {
                  path: 'dashboard',
                  element: <UserDashboard />
                },
                {
                  path: 'view',
                  element: <User />
                  //   element: <ProtectedRoute element={User} moduleName={MODULE.USER} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'add-user',
                  element: <AddUser />
                  //   element: <ProtectedRoute element={AddUser} moduleName={MODULE.USER} permission={PERMISSIONS.CREATE} />
                }
              ]
            },
            // Company
            {
              path: 'company',
              children: [
                {
                  path: 'dashboard',
                  element: <CompanyDashboard />
                },
                {
                  path: 'view',
                  element: <Company />
                  //   element: <ProtectedRoute element={Company} moduleName={MODULE.COMPANY} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'add-company',
                  element: <AddCompany />
                  //   element: <ProtectedRoute element={AddCompany} moduleName={MODULE.COMPANY} permission={PERMISSIONS.CREATE} />
                },
                {
                  path: 'add-company-branch',
                  element: <AddBranch />
                  //   element: <ProtectedRoute element={AddBranch} moduleName={MODULE.COMPANY} permission={PERMISSIONS.CREATE} />
                },
                {
                  path: 'overview/:id',
                  element: <CompanyOverview />
                  //   element: <ProtectedRoute element={CompanyOverview} moduleName={MODULE.COMPANY} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'add-company-rate',
                  element: <CompanyRateListing />
                },
                {
                  path: 'edit/:id',
                  element: <EditCompany />
                },
                {
                  path: 'edit-company-branch/:id',
                  element: <EditBranch />
                }
              ]
            },
            // Vendor
            {
              path: 'vendor',
              children: [
                {
                  path: 'dashboard',
                  element: <VendorDashboard />
                },
                {
                  path: 'view',
                  element: <Vendor />
                  //   element: <ProtectedRoute element={Vendor} moduleName={MODULE.VENDOR} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'add-vendor',
                  element: <AddVendor />
                  //   element: <ProtectedRoute element={AddVendor} moduleName={MODULE.VENDOR} permission={PERMISSIONS.CREATE} />
                },
                {
                  path: 'overview/:id',
                  element: <VendorOverview />
                  //   element: <ProtectedRoute element={VendorOverview} moduleName={MODULE.VENDOR} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'view-vendor-rate',
                  element: <VendorRatelisting />
                },
                {
                  path: 'add-vendor-rate',
                  element: <AddCabRateVendor />
                },
                {
                  path: 'edit/:id',
                  element: <EditVendor />
                }
              ]
            },
            // Driver
            {
              path: 'driver',
              children: [
                {
                  path: 'dashboard',
                  element: <DriverDashboard />
                },
                {
                  path: 'view',
                  element: <Driver />
                  //   element: <ProtectedRoute element={Driver} moduleName={MODULE.DRIVER} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'overview/:id',
                  element: <DriverOverview />
                  //   element: <ProtectedRoute element={DriverOverview} moduleName={MODULE.DRIVER} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'view-driver-rate',
                  element: <DriverRate />
                },
                {
                  path: 'add-driver-rate',
                  element: <AddCabRateDriver />
                },
                {
                  path: 'edit/:id',
                  element: <EditDriver />
                }
              ]
            },
            // Cab
            {
              path: 'cab',
              children: [
                {
                  path: 'dashboard',
                  element: <CabDashBoard />
                },
                {
                  path: 'view',
                  element: <Cab />
                  //   element: <ProtectedRoute element={Cab} moduleName={MODULE.CAB} permission={PERMISSIONS.READ} />
                },
                {
                  path: 'add-cab',
                  element: <AddCab />
                },
                {
                  path: 'edit/:id',
                  element: <AddCab />
                },
                {
                  path: 'overview/:id',
                  element: <CabOverview />
                  //   element: <ProtectedRoute element={CompanyOverview} moduleName={MODULE.COMPANY} permission={PERMISSIONS.READ} />
                }
              ]
            }
          ]
        },

        // Reports
        {
          path: 'reports',
          // element: <Reports />,
          children: [
            // Cab Provider
            {
              path: 'cabProvider/company-report',
              element: <CompanyReports />
            },
            {
              path: 'cabProvider/advance-report',
              element: <AdvanceReports />
            },
            {
              path: 'cabProvider/cab-report',
              element: <CabReports />
            },
            {
              path: 'cabProvider/trip-report',
              element: <TripReports />
            },

            // Vendor
            {
              path: 'vendor/company-report',
              element: <CompanyWiseReportForVendor />
            },
            {
              path: 'vendor/advance-report',
              element: <AdvanceReportsForVendor />
            },
            {
              path: 'vendor/cab-report',
              element: <CabReportsForVendor />
            },
            // Driver
            {
              path: 'driver/company-report',
              element: <CompanyWiseReportForDriver />
            },
            {
              path: 'driver/advance-report',
              element: <AdvanceReportsForDriver />
            },
            {
              path: 'driver/cab-report',
              element: <CabReportsForDriver />
            }
          ]
        },

        {
          path: 'reports-driver',
          element: <ReportDriver />
        },

        // Master
        {
          path: 'master',
          children: [
            {
              path: 'role',
              element: <Role />
              //   element: <ProtectedRoute element={Role} moduleName={MODULE.ROLE} permission={PERMISSIONS.READ} />
            },
            {
              path: 'zone',
              element: <Zone />
              //   element: <ProtectedRoute element={Zone} moduleName={MODULE.ZONE} permission={PERMISSIONS.READ} />
            },
            {
              path: 'zone-type',
              element: <ZoneType />
              //   element: <ProtectedRoute element={ZoneType} moduleName={MODULE.ZONE_TYPE} permission={PERMISSIONS.READ} />
            },
            {
              path: 'cab-type',
              element: <CabType />
              //   element: <ProtectedRoute element={CabType} moduleName={MODULE.CAB_TYPE} permission={PERMISSIONS.READ} />
            }
          ]
        },

        // Settings
        {
          path: 'settings',
          children: [
            {
              path: 'account',
              element: <AccountSettings />
            },

            // Roster Settings
            {
              path: 'roster',
              children: [
                // Create Roster Template
                {
                  path: 'create-template',
                  element: <RosterSetting />
                }
              ]
            },

            // Invoice Settings
            {
              path: 'invoice',
              element: <InvoiceSettings />
            }
          ]
        },

        {
          path: 'temp1',
          element: <Temp1 />
        }
      ]
    },

    {
      path: '/maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    },

    {
      path: '*',
      element: <PageNotFound />
    }
  ]
};

export default CabProvidorRoutes;
