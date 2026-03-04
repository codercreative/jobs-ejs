const express = require("express");
const router = express.Router();


const {
  getAllJobs,
  createJob,
  getNewJobForm,
  getEditJobForm,
  updateJob,
  deleteJob,
} = require("../controllers/jobs")

// GET /jobs (display all the job listings belonging to this user)
// POST /jobs (Add a new job listing)
// GET /jobs/new (Put up the form to create a new entry)
// GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
// POST /jobs/update/:id (Update a particular entry)
// POST /jobs/delete/:id (Delete an entry)

router.get("/", getAllJobs)
router.post("/", createJob)
router.get("/new", getNewJobForm)
router.get("/edit/:id", getEditJobForm)
router.post("/update/:id", updateJob)
router.post("/delete/:id", deleteJob)

module.exports = router