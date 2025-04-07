// controllers/candidateController.js
const Candidate = require('../models/Candidate');

// Create a new candidate
exports.createCandidate = async (req, res) => {
  try {
    const { candidateId, fullName, officialEmail } = req.body;

    // Check if candidate with this ID already exists
    const existingCandidate = await Candidate.findOne({ candidateId });
    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this ID already exists'
      });
    }

    // Set file paths if files were uploaded
    let photoUrl = null;
    let cvPath = null;

    if (req.files) {
      if (req.files.photo && req.files.photo.length > 0) {
        photoUrl = req.files.photo[0].path.replace(/\\/g, '/');
      }

      if (req.files.cv && req.files.cv.length > 0) {
        cvPath = req.files.cv[0].path.replace(/\\/g, '/');
      }
    }

    // Set default password instead of generating a random one
    const password = "TARS@12";

    // Create the candidate object - Make sure email is explicitly set
    const newCandidate = new Candidate({
      ...req.body,
      photoUrl,
      cvPath,
      email: officialEmail, // Use officialEmail from req.body
      password
    });

    // Save to database
    await newCandidate.save();

    // Return success response with credentials
    res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      credentials: {
        candidateId: newCandidate.candidateId,
        email: newCandidate.email,
        password: password // Use the default password directly
      }
    });

  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating candidate',
      error: error.message
    });
  }
};

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().select('-password -passwordPlain');
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving candidates',
      error: error.message
    });
  }
};

// Get a single candidate by ID
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      candidateId: req.params.id
    }).select('-password -passwordPlain');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving candidate',
      error: error.message
    });
  }
};

// Update a candidate
exports.updateCandidate = async (req, res) => {
  try {
    let candidate = await Candidate.findOne({ candidateId: req.params.id });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Update file paths if new files were uploaded
    if (req.files) {
      if (req.files.photo && req.files.photo.length > 0) {
        req.body.photoUrl = req.files.photo[0].path.replace(/\\/g, '/'); // Changed photoPath to photoUrl
      }

      if (req.files.cv && req.files.cv.length > 0) {
        req.body.cvPath = req.files.cv[0].path.replace(/\\/g, '/');
      }
    }

    // Update candidate
    candidate = await Candidate.findOneAndUpdate(
      { candidateId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).select('-password -passwordPlain');

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating candidate',
      error: error.message
    });
  }
};

// Delete a candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ candidateId: req.params.id });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Delete the candidate
    await Candidate.findOneAndDelete({ candidateId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting candidate',
      error: error.message
    });
  }
};

// Login candidate
exports.loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if candidate exists
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await candidate.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        candidateId: candidate.candidateId,
        fullName: candidate.fullName,
        email: candidate.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};