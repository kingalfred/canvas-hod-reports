import React from 'react'
import firebase from 'firebase'
import moment from 'moment'

import Assignments from './Assignments'

// var PieChart = require('react-chartjs').Pie
// var randomMC = require('random-material-color')

export default class App extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      days: 100,
      lastChanged: null,
      assignments: {},
    }
    
    this._getLastRefresh()
    // this._refresh()
  }
  
  _getLastRefresh = async () => {
    var data = await firebase.firestore()
      .doc('other/meta')
      .get()
      
    this.setState({ lastChanged: moment(data.data().lastChanged).fromNow() })
  }
  
  // _refresh = async () => {
  //   var d = new Date()
  //   d.setDate(d.getDate() - this.state.days)
    
  //   var data = await firebase.firestore()
  //     .collection('assignments')
  //     .where('data.date', '>', d)
  //     .get()
    
  //   var assignments = {}
    
  //   data.forEach(assignment => {
  //     console.log(assignment.data())
  //     // Initialise an array if it doesn't exist
  //     if (!assignments[assignment.data().department]) {
  //       assignments[assignment.data().department] = []
  //     }
  //     // Add data to the array of the current data
  //     assignments[assignment.data().department] = [ ...assignments[assignment.data().department], assignment.data() ]
  //   })
    
  //   this.setState({ assignments })
  //   console.log({assignments})
  // }
  
  // componentDidMount() {
  //   this._refresh()
  // }
  
  // getTeacherChart(assignments) {
  //   var assignmentsPerTeacher = {}
  //   for (var assignment of assignments) {
  //     if (!assignmentsPerTeacher[assignment.teacher]) {
  //       assignmentsPerTeacher[assignment.teacher] = 0
  //     }
  //     ++assignmentsPerTeacher[assignment.teacher]
  //   }
  //   var pieData = []
  //   for (var teacher of Object.keys(assignmentsPerTeacher)) {
  //     pieData.push({
  //       value: assignmentsPerTeacher[teacher],
  //       color: randomMC.getColor(),
  //       highlight: randomMC.getColor(),
  //       label: teacher
  //     })
  //   }
  //   return <PieChart data={pieData} width="600" height="250"/>
  // }
  
  // getYearGroupChart(assignments) {
  //   var assignmentsPerYearGroup = {}
  //   for (var assignment of assignments) {
  //     if (!assignmentsPerYearGroup[assignment.yearGroup]) {
  //       assignmentsPerYearGroup[assignment.yearGroup] = 0
  //     }
  //     ++assignmentsPerYearGroup[assignment.yearGroup]
  //   }
  //   var pieData = []
  //   for (var yearGroup of Object.keys(assignmentsPerYearGroup)) {
  //     pieData.push ({
  //       value: assignmentsPerYearGroup[yearGroup],
  //       color: randomMC.getColor(),
  //       highlight: randomMC.getColor(),
  //       label: yearGroup
  //     })
  //   }
  //   return <PieChart data={pieData} width="600" height="250"/>
  // }
  
  render() {
    return (
    <div className="container">
      <h1 className="mt-5 mb-5">
        Head of Department Reports
      </h1>
      
      <div className="alert alert-info">
        Last Refreshed {this.state.lastChanged}
      </div>
      
      <form>
        <div className="form-group">
          <label htmlFor="days">Number of days to search back on</label>
          <input type="number" className="form-control" id="days" value={this.state.days} onChange={e => { this.setState({days: e.target.value}) }} />
          <small id="dayshelp" className="form-text text-muted">e.g. assignments in last <i>x</i> days</small>
        </div>
      </form>
    
      <Assignments />
    </div>
    ) 
  }
}
