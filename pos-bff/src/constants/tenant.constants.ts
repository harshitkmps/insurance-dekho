export const TenantConfig = async function (tenantId) {
  const masterPOSUUID = `MASTER_POS_UUID_${tenantId}`;
  return {
    uuid: process.env[masterPOSUUID],
  };
};
