import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAppointmentsForDay } from "helpers/selectors";

export default function useApplicationData() {
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
    appointmentsForDay: [],
  });

  const setDay = day => setState({ ...state, day });

  const bookInterview = (id, interview) => {
    const newDay = state.days.filter(day => day.appointments.includes(id))[0];

    newDay.spots--;

    const newDays = state.days

    for (let i = 0; i < state.days.length; i++) {
      if (state.days[i].id === newDay.id) {
        newDays.splice(i, 1, newDay)
      }
    }

    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    return axios.put(`/api/appointments/${id}`, { interview })
      .then(() => setState({ ...state, appointments, days: newDays }))
  }

  const cancelInterview = (id) => {
    const newDay = state.days.filter(day => day.appointments.includes(id))[0];

    newDay.spots++;

    const newDays = state.days

    for (let i = 0; i < state.days.length; i++) {
      if (state.days[i].id === newDay.id) {
        newDays.splice(i, 1, newDay)
      }
    }

    const appointment = {
      ...state.appointments[id],
      interview: null,
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    }

    return axios.delete(`/api/appointments/${id}`)
      .then(() => setState({ ...state, appointments, days: newDays }));
  }

  useEffect(() => {
    Promise.all([
      Promise.resolve(axios.get("/api/days")),
      Promise.resolve(axios.get("/api/appointments")),
      Promise.resolve(axios.get("/api/interviewers")),
    ]).then(all => {
      const days = all[0].data
      const appointments = all[1].data
      const interviewers = all[2].data
      const appointmentsForDay = getAppointmentsForDay(days, appointments, state.day);
      const spotsForDay = appointmentsForDay.filter(appointment => !appointment.interview).length;

      setState(prev => ({ ...state, days, appointments, interviewers, appointmentsForDay, spotsForDay }));
    })
  }, []);

  useEffect(() => {
    setState(prev => ({ ...state, appointmentsForDay: getAppointmentsForDay(state.days, state.appointments, state.day) }))
  }, [state.day]);

  return { state, setDay, bookInterview, cancelInterview };
}