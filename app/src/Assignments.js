import React from 'react'
import firebase from 'firebase'

class Assignments extends React.Component {
  constructor(props) {
    super(props)
    
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAyVr2jEQ_TD38pJAaFTvt1Wkqmw3EeXqo",
        authDomain: "canvas-hod-reports.firebaseapp.com",
        databaseURL: "https://canvas-hod-reports.firebaseio.com",
        projectId: "canvas-hod-reports",
        storageBucket: "canvas-hod-reports.appspot.com",
        messagingSenderId: "72986432772"
      })
    }
    
    
    this.state = {}
  }
  
  async componentDidMount() {
    var tempState = {}
    
    var data = await firebase.firestore()
      .collection('assignments')
      // .where('data.date', '>', d)
      .get()
      
    data.forEach(assignment => {
      var assignment = assignment.data()
      
      // If there isn't a department in tempState
      if (!tempState[assignment.department]) {
        tempState[assignment.department] = []
      }
      
      // Add assignment to it's department
      tempState[assignment.department].push(assignment)
    })
    
    this.setState(...tempState)
  }
  
  render() {
    return (
      <div className="mt-5">
        {Object.keys(this.state).map(departmentid => {
          return this.state.assignments.map(assignment => <p>assignment.name</p>)
        })}
      </div>
    )
  }
}

export default Assignments
