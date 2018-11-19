const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)


const util = require('util')
const needle = require('needle')
const options = {
  headers: {
    'Authorization': 'Bearer ' + functions.config().canvas.token
  }
}

function getDepartments() {
  return needle('get', 'https://kingalfred.test.instructure.com/api/v1/accounts/1/sub_accounts?per_page=50', options)
}

function getCoursesInDepartment(department) {
  return needle('get', 'https://kingalfred.test.instructure.com/api/v1/accounts/' + department.id + '/courses', options)
}

function getAssignmentsInCourse(course) {
  return needle('get', 'https://kingalfred.test.instructure.com/api/v1/courses/' + course.id + '/assignments?per_page=100', options)
}


exports.sync = functions.https.onRequest((req, res) => {
  // Get all departments
  getDepartments()
    .then(departments => {
      var departmentPromises = []
      
      // For each department...
      for (var department of departments.body) {
        // Add promise to array which resolves to the courses in the department
        departmentPromises.push(
          getCoursesInDepartment(department)
        )
      }
      
      // do all the requests for the courses
      return Promise.all(departmentPromises)
    })
    .then(departmentCourses => {
      // departmentCourses is now an array of arrays containing courses
      // [ [englishcourse1, englishcourse2], [mathcourse1, mathcourse2], [sciencecourse1, sciencecourse2] ]
      
      var coursePromises = []
      var allTheCourses = []
      
      // In each department
      for (var courses of departmentCourses) {
        // In each course
        for (var course of courses.body) {
          allTheCourses.push(course)
          
          // Create a promise which resolves to the assignments in that course
          coursePromises.push(
            getAssignmentsInCourse(course)
          )
        }
      }
      
      admin.firestore().doc('canvas/data')
        .update({
          courses: allTheCourses
        })
      
      // Do the queries
      return Promise.all(coursePromises)
    })
    .then(courseTasks => {
      var assignments = []
      
      for (var course of courseTasks) {
        for (var assignment of course.body) {
          assignments.push(assignment)
        }
      }
      
      admin.firestore().doc('canvas/data')
        .update({
          assignments: assignments,
          lastChanged: new Date()
        })
      
      return res.send(assignments)
    })
    .catch(err => {
      throw err
    })

})