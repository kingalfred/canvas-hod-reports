const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const needle = require('needle')
const options = {
  headers: {
    'Authorization': 'Bearer ' + functions.config().canvas.token
  }
}

async function getDepartments() {
  let url = 'https://kingalfred.test.instructure.com/api/v1/accounts/1/sub_accounts?per_page=100'
  var departments = await needle('get', url, options)
  
  return departments.body
}

async function getCoursesInDepartment(id) {
  // TODO: investigate per_page, it's limiting the number of courses returned
  // for now, it's 10 so that tests can be made quickly
  let url = 'https://kingalfred.test.instructure.com/api/v1/accounts/' + id + '/courses?include=teachers&per_page=100'
  var courses = await needle('get', url, options)
  
  return courses.body
}

async function getAssignmentsInCourse(id) {
  let url = 'https://kingalfred.test.instructure.com/api/v1/courses/' + id + '/assignments?per_page=100'
  var assignments = await needle('get', url, options)
  
  return assignments.body
}


exports.sync = functions.https.onRequest(async (req, res) => {
  var data = {}
  
  // Get departments
  var departments = await getDepartments()
  
  // For each department...
  await Promise.all(departments.map(async (department) => {
    // Get all of it's courses
    var courses = await getCoursesInDepartment(department.id)
    
    // Save the courses (to allow for assignments to add themselves to their course)
    data[department.id] = {
      name: department.name,
      departmentBody: department,
      courses
    }
    
    // this complicated line of code basically means that each function will
    // happen asynchronously
    await Promise.all(courses.map(async (course) => {
      // Get assignments in the course
      var assignments = await getAssignmentsInCourse(course.id)
      
      data[department.id].courses.find((x, i) => {
        if (x.id === course.id) {
          // Save to data
          data[department.id].courses[i] = { ...x, assignments: assignments.map(x => ({ ...x, date: new Date(x.created_at)})) }
          
          return true
        }
      })
    }))
  }))
  
  // Now that we have a big object with all the departments, courses, assignments,
  // etc. we should move all assignments from it to a single array wich we push
  // to firestore
  var assignments = []
  
  for (var i of Object.keys(data)) {
    for (var course of data[i].courses) {
      for (var assignment of course.assignments) {
        assignments.push({
          department: data[i].departmentBody.id,
          course: course.id,
          teachers: course.teachers,
          data: assignment
        })
      }
    }
  }
  
  var b = admin.firestore().batch()
  
  for (var a of assignments) {
    b.set(
      admin.firestore().doc('assignments/' + a.data.id),
      a
    )
  }

  // Update lastChanged time
  b.update(
    admin.firestore().doc('other/meta'),
    { lastChanged: new Date() }
  )
  
  // Do the query
  await b.commit()
  
  // Send back the assignments, mainly for debugging purposes
  res.send(assignments)
})