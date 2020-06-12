import React, { useReducer, useEffect } from "react";
import axios from "axios";
import { getAppointmentsForDay } from "helpers/selectors";

export default function useApplicationData() {
  const SET_DAY = "SET_DAY";
  const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
  const SET_INTERVIEW = "SET_INTERVIEW";

  function reducer(state, action) {
    switch (action.type) {
      case SET_DAY:
        return { ...state, ...action }
      case SET_APPLICATION_DATA:
        return { ...state, ...action }
      case SET_INTERVIEW:
        return { ...state, ...action }
      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
    appointmentsForDay: [],
  });

  const setDay = day => dispatch({ type: SET_DAY, day});

  const bookInterview = (id, interview, type) => {
    const newDay = state.days.filter(day => day.appointments.includes(id))[0];

    if (type === "CREATE") newDay.spots--;

    const newDays = state.days

    newDays.map(day => {
      if (day.id === newDay.id) {
        day = newDay
      }
    })

    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    return axios.put(`/api/appointments/${id}`, { interview })
      .then(() => dispatch({ type: SET_INTERVIEW, appointments, days: newDays }))
  }

  const cancelInterview = (id) => {
    const newDay = state.days.filter(day => day.appointments.includes(id))[0];

    newDay.spots++;

    const newDays = state.days

    newDays.map(day => {
      if (day.id === newDay.id) {
        day = newDay
      }
    })

    const appointment = {
      ...state.appointments[id],
      interview: null,
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    }

    return axios.delete(`/api/appointments/${id}`)
      .then(() => dispatch({ type: SET_INTERVIEW, appointments, days: newDays }));
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

      dispatch({ type: SET_APPLICATION_DATA, days, appointments, interviewers, appointmentsForDay });
    })
  }, []);

  useEffect(() => {
    const appointmentsForDay = getAppointmentsForDay(state.days, state.appointments, state.day);

    dispatch({ type: SET_APPLICATION_DATA, days: state.days, appointments: state.appointments, interviewers: state.interviewers, appointmentsForDay: state.appointmentsForDay });
  }, [state.day]);

  return { state, setDay, bookInterview, cancelInterview };
}