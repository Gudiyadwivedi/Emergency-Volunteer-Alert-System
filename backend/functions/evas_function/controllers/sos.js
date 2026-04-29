const catalyst = require("zcatalyst-sdk-node");

exports.createSOS = async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    // Basic validation
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "userId, latitude, and longitude are required",
      });
    }

    const catalystApp = catalyst.initialize(req);

    const sosTable = catalystApp.datastore().table("sos");

    const rowData = {
      userId: userId,
      latitude: latitude,
      longitude: longitude,
      status: "active",
    };

    const insertedRow = await sosTable.insertRow(rowData);

    return res.status(201).json({
      success: true,
      message: "SOS created successfully",
      sos: insertedRow,
    });
  } catch (error) {
    console.error("Create SOS Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




exports.getAllSos = async (req, res) => {
  try {

    const catalystApp = catalyst.initialize(req);

    const query = `SELECT * FROM sos 
        LEFT JOIN  userTable ON 
        userTable.ROWID=sos.userId
        ORDER BY sos.CREATEDTIME DESC
        `
    const result = await catalystApp.zcql().executeZCQLQuery(query)

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Get SOS error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Get Active SOS (Volunteer View)
exports.getActiveSos = async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const query = `
  SELECT * FROM sos 
  LEFT JOIN  userTable ON 
  userTable.ROWID=sos.userId
  WHERE status = 'active'
  ORDER BY CREATEDTIME DESC
`;
    const result = await catalystApp.zcql().executeZCQLQuery(query)

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Get Active SOS error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get SOS by ID
exports.getSosById = async (req, res) => {
  try {
        const catalystApp = catalyst.initialize(req);

    const { id } = req.params;

       const query = `
  SELECT * FROM sos 
  LEFT JOIN  userTable ON 
  userTable.ROWID=sos.userId
  WHERE sos.ROWID = ${id}
  ORDER BY CREATEDTIME DESC
`;
    const result = await catalystApp.zcql().executeZCQLQuery(query)
console.log(result)
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "SOS not found"
      });
    }
    res.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error("Get SOS by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Assign Volunteer to SOS


exports.assignVolunteer = async (req, res) => {
  try {
    const sosId = req.params.id;
    const volunteerId = req.body.volunteerId;

    if (!sosId || !volunteerId) {
      return res.status(400).json({
        success: false,
        message: "sosId and volunteerId are required",
      });
    }

    const catalystApp = catalyst.initialize(req);
    const sosTable = catalystApp.datastore().table("sos");
    const userTable = catalystApp.datastore().table("userTable");

    // ✅ Fetch volunteer details from userTable
    let volunteerDetails = null;
    try {
      const volunteerData = await userTable.getRow(volunteerId);
      if (volunteerData) {
        volunteerDetails = {
          id: volunteerData.ROWID,
          name: volunteerData.name,
          email: volunteerData.email,
          phone: volunteerData.phone,
          role: volunteerData.role
        };
      }
    } catch (err) {
      console.log("Could not fetch volunteer details:", err.message);
    }

    // Update SOS row with volunteer ID
    const updatedRow = await sosTable.updateRow({
      ROWID: sosId,
      assignedVolunteerId: volunteerId,
      status: "assigned",
    });

    return res.status(200).json({
      success: true,
      message: "Volunteer assigned successfully",
      data: {
        sos: updatedRow,
        volunteer: volunteerDetails  // ✅ Sending volunteer details in response
      },
    });
  } catch (error) {
    console.error("Assign volunteer error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// 6. Update SOS Status


exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "SOS ID and status are required",
      });
    }

    const catalystApp = catalyst.initialize(req);
    const sosTable = catalystApp.datastore().table("sos");

    // Simple update with only status
    const updateData = {
      ROWID: id,
      status: status,
      MODIFIEDTIME: new Date().toISOString()
    };

    await sosTable.updateRow(updateData);

    return res.status(200).json({
      success: true,
      message: `SOS status updated to ${status}`,
    });

  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};
// 7. Get Available Volunteers

exports.getVolunteers = async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const zcql = catalystApp.zcql();

    const query = `
      SELECT ROWID, name, email, phone
      FROM userTable
      WHERE role = 'volunteer' AND isVerified = true
    `;

    const result = await zcql.executeZCQLQuery(query);

    const volunteers = result.map((row) => ({
      id: row.userTable.ROWID,
      name: row.userTable.name,
      email: row.userTable.email,
      phone: row.userTable.phone,
    }));

    return res.status(200).json({
      success: true,
      data: volunteers,
    });
  } catch (error) {
    console.error("Get volunteers error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

