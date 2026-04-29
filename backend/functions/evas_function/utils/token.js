const catalyst = require("zcatalyst-sdk-node");
const crypto = require("crypto");

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

const refreshAccess = async (userId, req) => {
  try {
    if (!req) {
      throw new Error("Request object (req) is required for catalyst.initialize()");
    }

    const catalystApp = catalyst.initialize(req);

    const zcql = catalystApp.zcql();

    const query = `SELECT * FROM userTable WHERE ROWID = '${userId}'`;
    const result = await zcql.executeZCQLQuery(query);

    if (!result.length) {
      throw new Error("User not found");
    }

    const user =result[0].userTable;

    const accessToken = generateToken();
    const refreshToken = generateToken();

    const table = catalystApp.datastore().table("userTable");

    await table.updateRow({
      ROWID: user.ROWID,
      refreshToken,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("refreshAccess error:", error);
    throw error;
  }
};

module.exports = refreshAccess;