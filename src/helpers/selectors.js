export function getAppointmentsForDay(days, appointments, day) {
  const appointmentsArr = [];

  const filteredDay = days.filter(stateDay => stateDay.name === day)[0];

  if (!filteredDay) return appointmentsArr;

  for (const id of filteredDay.appointments) {
    appointmentsArr.push(appointments[id]);
  }

  return appointmentsArr;
}

export function getInterviewersForDay(days, interviewers, day) {
  const interviewersArr = [];

  const filteredDay = days.filter(stateDay => stateDay.name === day)[0];

  if (!filteredDay) return interviewersArr;

  for (const id of filteredDay.interviewers) {
    interviewersArr.push(interviewers[id]);
  }

  return interviewersArr;
}

export function getInterview(state, interview) {
  if (!interview) return null;

  const student = interview.student;
  const id = interview.interviewer;

  const interviewer = state.interviewers[id];

  return { student, interviewer };
}