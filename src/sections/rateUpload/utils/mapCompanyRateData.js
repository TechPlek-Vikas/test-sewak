import axiosServices from 'utils/axios';

export const StructurePayload = async (data) => {
  try {
    // Fetch both API responses in parallel
    const [zoneResponse, vehicleTypeResponse] = await Promise.all([
      axiosServices.get('/zoneType/zoneType/zone/wise'),
      axiosServices.get('/vehicleType')
    ]);

    // Extract and flatten zoneType data, and filter out empty objects
    const zoneData = zoneResponse.data.data || [];
    const zoneTypeData = zoneData
      .flatMap((item) => item.zoneTypes || []) // Flatten zoneTypes arrays
      .filter((zoneType) => zoneType && Object.keys(zoneType).length > 0); // Exclude null or empty objects

    // Extract vehicleType data
    const vehicleTypeData = vehicleTypeResponse.data.data || [];

    const idData = replaceNamesWithIds(data, zoneData, zoneTypeData, vehicleTypeData);

    const finalPayload = restructureData(idData);

    // Optionally return the processed data if needed
    return { success: true, finalPayload: finalPayload };
  } catch (error) {
    // Handle any errors in the API requests
    console.error('Error in StructurePayload:', error);
    // Optionally, return default values or an error state
    return { success: false, finalPayload: [] };
  }
};

const replaceNamesWithIds = (data, zoneData, zoneTypeData, vehicleTypeData) => {
  // Create lookup maps for zoneName, zoneTypeName, and vehicleTypeName
  const zoneNameMap = zoneData.reduce((acc, zone) => {
    acc[zone.zoneName] = zone._id;
    return acc;
  }, {});

  const zoneTypeNameMap = zoneTypeData.reduce((acc, zoneType) => {
    acc[zoneType.zoneTypeName] = zoneType._id;
    return acc;
  }, {});

  const vehicleTypeNameMap = vehicleTypeData.reduce((acc, vehicleType) => {
    acc[vehicleType.vehicleTypeName] = vehicleType._id;
    return acc;
  }, {});

  // Replace names with their corresponding _ids in the data array
  return data.map((item) => {
    return {
      ZONENAME: zoneNameMap[item.ZONENAME] || item.ZONENAME, // Replace zoneName with _id
      ZONETYPE: zoneTypeNameMap[item.ZONETYPE] || item.ZONETYPE, // Replace zoneType with _id
      VEHICLETYPE: vehicleTypeNameMap[item.VEHICLETYPE] || item.VEHICLETYPE, // Replace vehicleType with _id
      COMPANYRATE: item.COMPANYRATE,
      DUALTRIPRATE: item.DUALTRIPRATE,
      COMPANYGUARDRATE: item.COMPANYGUARDRATE
    };
  });
};

const restructureData = (data) => {
  // Create a map to hold the grouped data by zoneName and zoneType
  const groupedData = {};

  data.forEach((item) => {
    const { ZONENAME, ZONETYPE, VEHICLETYPE, COMPANYRATE, DUALTRIPRATE, COMPANYGUARDRATE } = item;

    // Ensure ZONENAME is always non-null and unique
    const zoneName = ZONENAME || 'UNKNOWN_ZONE_NAME'; // Ensure ZONENAME is valid

    // Handle ZONETYPE being null or undefined
    const zoneType = ZONETYPE || 'UNKNOWN_ZONE_TYPE'; // Use a placeholder for null zoneType

    // Initialize the group if it does not exist
    if (!groupedData[zoneName]) {
      groupedData[zoneName] = {};
    }

    // Ensure the combination of ZONENAME and ZONETYPE is unique
    if (!groupedData[zoneName][zoneType]) {
      groupedData[zoneName][zoneType] = {
        vehicleTypeID: VEHICLETYPE, // Save the first vehicleTypeID found for this zoneName/zoneType pair
        zoneNameID: zoneName, // Zone Name ID
        zoneTypeID: zoneType, // Zone Type ID (or placeholder)
        cabAmount: [],
        dualTripAmount: [],
        guardPrice: COMPANYGUARDRATE // Assign the guardPrice
      };
    }

    // Add vehicleType and corresponding rates (company rate and dual trip rate) into cabAmount
    if (COMPANYRATE !== undefined) {
      groupedData[zoneName][zoneType].cabAmount.push({
        vehicleTypeID: VEHICLETYPE,
        amount: COMPANYRATE
      });
    }

    // Add dual trip rate if available
    if (DUALTRIPRATE !== undefined) {
      groupedData[zoneName][zoneType].dualTripAmount.push({
        vehicleTypeID: VEHICLETYPE,
        amount: DUALTRIPRATE
      });
    }
  });

  // Convert groupedData object into an array to match the final structure
  const result = Object.values(groupedData).flatMap((zoneGroups) =>
    Object.values(zoneGroups).map((group) => ({
      vehicleTypeID: group.vehicleTypeID,
      zoneNameID: group.zoneNameID,
      zoneTypeID: group.zoneTypeID,
      cabAmount: group.cabAmount,
      dualTripAmount: group.dualTripAmount,
      guardPrice: group.guardPrice,
      cabRate: 0, // Placeholder for cabRate if needed
      dualTrip: group.dualTripAmount.length > 0 ? 1 : 0, // If there are any dual trip amounts, set 1, otherwise 0
      guard: group.guardPrice > 0 ? 1 : 0 // If guard price is greater than 0, set 1, otherwise 0
    }))
  );

  return result;
};
