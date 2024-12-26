/* eslint-disable no-unused-vars */
import { lazy } from 'react';

// project-imports
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import ProtectedRoute from 'components/common/guards/ProtectedRoute';
import { MODULE, PERMISSIONS } from 'constant';
import Create from 'pages/invoice/create/Create2';
import { element } from 'prop-types';
// import AllRosters from 'pages/Roster/AllRosters';
import AdvancesVendorTable from 'sections/cabprovidor/advances/advancesVendor/AdvancesVendorTable';
import AdvanceVendorType from 'sections/cabprovidor/advances/advancesVendor/AdvanceVendorType';
import AllRosters from 'pages/apps/roster';
import { ProtectedRoute1 } from 'components/common/guards/ProtectedRoute1';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));

const UnderConstruction = Loadable(lazy(() => import('components/maintenance/UnderConstruction')));

const PageNotFound = Loadable(lazy(() => import('pages/maintenance/error/404')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('pages')));
// Roster
// const RosterFileList = Loadable(lazy(() => import('pages/Roster/file-management')));
// const MapRosterFile = Loadable(lazy(() => import('pages/Roster/map-roster')));
// const ViewRoster = Loadable(lazy(() => import('pages/Roster/view-roster')));
// const AssignTrips = Loadable(lazy(() => import('pages/Roster/assign-trips')));

// Invoice
const InvoiceList = Loadable(lazy(() => import('pages/invoice/list/List')));
const InvoiceCreate = Loadable(lazy(() => import('pages/apps/invoice/Create')));
const InvoiceDetails = Loadable(lazy(() => import('pages/invoice/details/Details')));
const InvoiceCreate3 = Loadable(lazy(() => import('pages/invoice/create/Create3')));

// Management
const User = Loadable(lazy(() => import('pages/management/user')));
const AddUser = Loadable(lazy(() => import('pages/management/user/AddUser')));
// Vendor
const Vendor = Loadable(lazy(() => import('pages/management/vendor')));
const AddVendor = Loadable(lazy(() => import('pages/management/vendor/AddVendor')));
const VendorOverview = Loadable(lazy(() => import('pages/overview/VendorOverview')));

// Driver
const Driver = Loadable(lazy(() => import('pages/management/driver')));
const DriverOverview = Loadable(lazy(() => import('pages/overview/DriverOverview')));
// const AddDriver = Loadable(lazy(() => import('pages/management/driver/AddDriver')));
const EditDriver = Loadable(lazy(() => import('pages/management/driver/EditDriver')));

// Cab
const Cab = Loadable(lazy(() => import('pages/management/cab')));
const AddCab = Loadable(lazy(() => import('pages/management/cab/AddCab')));
const CabOverview = Loadable(lazy(() => import('pages/overview/CabOverview')));

// company
const Company = Loadable(lazy(() => import('pages/management/company')));
const AddCompany = Loadable(lazy(() => import('pages/management/company/AddCompany')));
const AddBranch = Loadable(lazy(() => import('pages/management/company/AddBranch')));
const CompanyOverview = Loadable(lazy(() => import('pages/overview/CompanyOverview')));

// reports
const Reports = Loadable(lazy(() => import('pages/reports/Reports')));
// Invoice
// const Invoice = Loadable(lazy(() => import('pages/invoices/Invoice')));
const Loans = Loadable(lazy(() => import('pages/invoices/Loans')));
const Advance = Loadable(lazy(() => import('pages/invoices/advance')));
const AdvanceType = Loadable(lazy(() => import('pages/invoices/advance/AdvanceType')));
// Master
const Role = Loadable(lazy(() => import('pages/master/Role')));
const Zone = Loadable(lazy(() => import('pages/master/zones')));
const ZoneType = Loadable(lazy(() => import('pages/master/zones/ZoneType')));

const CabType = Loadable(lazy(() => import('pages/master/CabType')));
// Cab Rate
const CabRate = Loadable(lazy(() => import('pages/master/CabRate')));
const AddCabRateVendor = Loadable(lazy(() => import('pages/master/CabRate/Vendor')));
const AddCabRateDriver = Loadable(lazy(() => import('pages/master/CabRate/Driver')));

//Trip
const TripList = Loadable(lazy(() => import('pages/trips/TripList')));
const TripView = Loadable(lazy(() => import('pages/trips/TripView')));

// Settings
const InvoiceSettings = Loadable(lazy(() => import('pages/setting/invoice')));

// reports
const CompanyWiseReportForVendor = Loadable(lazy(() => import('pages/reports/Company/Vendor')));
const CabReportsForVendor = Loadable(lazy(() => import('pages/reports/Cab/Vendor')));
const AdvanceReportsForVendor = Loadable(lazy(() => import('pages/reports/Advance/Vendor')));

// ==============================|| MAIN ROUTES ||============================== //

const VendorRoutes = {
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
          element: <UnderConstruction title="Home" />
        },
        // Dashboard
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute1
              allowedPermission={{
                [MODULE.DASHBOARD]: [PERMISSIONS.READ]
              }}
            >
              <Dashboard />
            </ProtectedRoute1>
          )
        },

        // Application
        {
          path: 'apps',
          children: [
            // Invoices
            {
              path: 'invoices',
              children: [
                // {
                //   path: 'dashboard',
                //   element: <UnderConstruction title="Invoice Dashboard" />
                // },
                {
                  path: 'list',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.INVOICE]: [PERMISSIONS.READ]
                      }}
                    >
                      <InvoiceList />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'create',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.INVOICE]: [PERMISSIONS.CREATE]
                      }}
                    >
                      <InvoiceCreate />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'test',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.INVOICE]: [PERMISSIONS.CREATE]
                      }}
                    >
                      <InvoiceCreate3 />
                    </ProtectedRoute1>
                  )
                },
                // {
                //   path: 'invoice',
                //   element: <InvoiceList />
                // },
                {
                  path: 'details/:id',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.INVOICE]: [PERMISSIONS.READ]
                      }}
                    >
                      <InvoiceDetails />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'edit/:id',
                  element: <UnderConstruction title="Edit Invoice" />
                },
                {
                  path: 'loans',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.LOAN]: [PERMISSIONS.READ]
                      }}
                    >
                      <Loans />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'advance',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.ADVANCE]: [PERMISSIONS.READ]
                      }}
                    >
                      <AdvancesVendorTable />
                    </ProtectedRoute1>
                  )
                }
                // {
                //   path: 'advance-type',
                //   element: <AdvanceVendorType />
                //   //   element: <ProtectedRoute element={AdvanceType} moduleName={MODULE.ADVANCE_TYPE} permission={PERMISSIONS.READ} />
                // }
              ]
            },

            // Trips
            {
              path: 'trips',
              children: [
                {
                  path: 'list',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.ROSTER]: [PERMISSIONS.READ]
                      }}
                    >
                      <TripList />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'trip-view/:id',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.ROSTER]: [PERMISSIONS.READ]
                      }}
                    >
                      <TripView />
                    </ProtectedRoute1>
                  )
                }
              ]
            }
          ]
        },

        // Management
        {
          path: 'management',
          children: [
            // User
            {
              path: 'user',
              children: [
                // {
                //   path: 'dashboard',
                //   element: <UnderConstruction title="User Dashboard" />
                // },
                {
                  path: 'view',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.USER_SETTING]: [PERMISSIONS.READ]
                      }}
                    >
                      <User />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'add-user',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.USER_SETTING]: [PERMISSIONS.CREATE]
                      }}
                    >
                      <AddUser />
                    </ProtectedRoute1>
                  )
                }
              ]
            },

            // Company
            {
              path: 'company',
              children: [
                // {
                //   path: 'dashboard',
                //   element: <UnderConstruction title="Company Dashboard" />
                // },
                {
                  path: 'view',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.COMPANY]: [PERMISSIONS.READ]
                      }}
                    >
                      <Company />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'overview/:id',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.COMPANY]: [PERMISSIONS.READ]
                      }}
                    >
                      <CompanyOverview />
                    </ProtectedRoute1>
                  )
                }
              ]
            },

            // Driver
            {
              path: 'driver',
              children: [
                // {
                //   path: 'dashboard',
                //   element: <UnderConstruction title="Driver Dashboard" />
                // },
                {
                  path: 'view',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.DRIVER]: [PERMISSIONS.READ]
                      }}
                    >
                      <Driver />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'overview/:id',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.DRIVER]: [PERMISSIONS.READ]
                      }}
                    >
                      <DriverOverview />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'edit/:id',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.DRIVER]: [PERMISSIONS.UPDATE]
                      }}
                    >
                      <EditDriver />
                    </ProtectedRoute1>
                  )
                }
                // {
                //   path: 'add-driver',
                //   element: <AddDriver />
                // }
              ]
            },

            // Cab
            {
              path: 'cab',
              children: [
                // {
                //   path: 'dashboard',
                //   element: <UnderConstruction title="Cab Dashboard" />
                // },
                {
                  path: 'view',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.CAB]: [PERMISSIONS.READ]
                      }}
                    >
                      <Cab />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'add-cab',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.CAB]: [PERMISSIONS.CREATE]
                      }}
                    >
                      <AddCab />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'edit/:id',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.CAB]: [PERMISSIONS.UPDATE]
                      }}
                    >
                      <AddCab />
                    </ProtectedRoute1>
                  )
                },
                {
                  path: 'overview/:id',
                  element: (
                    <ProtectedRoute1
                      allowedPermission={{
                        [MODULE.CAB]: [PERMISSIONS.READ]
                      }}
                    >
                      <CabOverview />
                    </ProtectedRoute1>
                  )
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
            // Vendor
            {
              path: 'vendor/company-report',
              element: (
                <ProtectedRoute1
                  allowedPermission={{
                    [MODULE.REPORT]: [PERMISSIONS.READ]
                  }}
                >
                  <CompanyWiseReportForVendor />
                </ProtectedRoute1>
              )
            },
            {
              path: 'vendor/advance-report',
              element: (
                <ProtectedRoute1
                  allowedPermission={{
                    [MODULE.REPORT]: [PERMISSIONS.READ]
                  }}
                >
                  <AdvanceReportsForVendor />
                </ProtectedRoute1>
              )
            },
            {
              path: 'vendor/cab-report',
              element: (
                <ProtectedRoute1
                  allowedPermission={{
                    [MODULE.REPORT]: [PERMISSIONS.READ]
                  }}
                >
                  <CabReportsForVendor />
                </ProtectedRoute1>
              )
            }
          ]
        },

        // Master
        {
          path: 'master',
          children: [
            {
              path: 'role',
              element: (
                <ProtectedRoute1
                  allowedPermission={{
                    [MODULE.ROLE]: [PERMISSIONS.READ]
                  }}
                >
                  <Role />
                </ProtectedRoute1>
              )
            }
          ]
        },

        // Settings
        {
          path: 'settings',
          children: [
            // Invoice Settings
            {
              path: 'invoice',
              element: (
                <ProtectedRoute1
                  allowedPermission={{
                    [MODULE.INVOICE_SETTING]: [PERMISSIONS.READ]
                  }}
                >
                  <InvoiceSettings />
                </ProtectedRoute1>
              )
            }
          ]
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

export default VendorRoutes;
