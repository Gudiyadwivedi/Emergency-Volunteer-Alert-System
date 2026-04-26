import Emergency from "../models/emergency.js";
import User from "../models/user.js"; // Volunteer bhi User hi hai (role="volunteer")


export const createSOS= async (req, res) => {
  try {
    const victimId = req.user._id; // logged in user

    const { emergencyType, description, lat, lng } = req.body;

    // validation
    if (!emergencyType || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "emergencyType, lat, lng are required",
      });
    }

    // 1) create emergency
    const emergency = await Emergency.create({
      victimId,
      emergencyType,
      description,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      status: "active",
      timeline: [
        {
          message: "Emergency created",
        },
      ],
    });

    // 2) find nearby verified volunteers
    const volunteers = await User.find({
      role: "volunteer",
      verified: true,
      available: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 5000, // 5km
        },
      },
    }).select("_id name phone location");

    // 3) store notified volunteers
    emergency.notifiedVolunteers = volunteers.map((v) => v._id);

    emergency.timeline.push({
      message: `${volunteers.length} volunteers notified`,
    });

    await emergency.save();

    return res.status(201).json({
      success: true,
      message: "SOS Created Successfully",
      emergency,
      nearbyVolunteers: volunteers,
    });
  } catch (error) {
    console.log("CREATE SOS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};