const Jobs = require("../models/Jobs")


const getAllJobs = async (req,res) => {
  // res.send("getAllJobs called")
const jobs = await Jobs.find({createdBy: req.user._id})
  res.render("jobs", { jobs });
  
}

const createJob = async (req, res) => {
  try {
    await Jobs.create({...req.body, createdBy: req.user._id})
    req.flash("success_msg", "Job successfully created!")
    res.redirect("/jobs")
  } catch (err) {
    console.log(err)
    res.status(400).send("Job cannot be created")
  }
}

const getNewJobForm = (req, res) => {
 res.render("job", {job: null})
}

const getEditJobForm = async (req, res) => {
  try {
    
    const jobId = req.params.id
    const job = await Jobs.findById(jobId)
    res.render("job", {job})
  } catch (err) {
    console.log(err)
    res.status(404).send("Job not found")
  }
}

const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id
    const job = await Jobs.findOne({_id: jobId, createdBy: req.user._id})
    if (!job) {
      req.flash("error_msg", "Job not found")
      res.redirect("/jobs")
      return
    }
    await Jobs.findByIdAndUpdate(jobId, {company: req.body.company, position: req.body.position, status: req.body.status}, {new: true, runValidators: true})
    req.flash("success_msg", "Job successfully updated!")
    res.redirect("/jobs")
  } catch (err) {
    console.log(err)
    res.status(404).send("Cannot update job")
  }
}

const deleteJob = async (req, res) => {
 try {
  const jobId = req.params.id
  const job = await Jobs.findOne({_id: jobId, createdBy: req.user._id})
  if (!job) {
    req.flash("error_msg", "Job not found")
    res.redirect("/jobs")
    return
  }
  await Jobs.findByIdAndDelete(jobId)
  req.flash("success_msg", "Job successfully deleted!")
  res.redirect("/jobs")

 } catch (err) {
  console.log(err)
  res.status(404).send("Cannot delete job")
  
 }
}

module.exports = {
    getAllJobs,
    createJob,
    getNewJobForm,
    getEditJobForm,
    updateJob,
    deleteJob,
  }