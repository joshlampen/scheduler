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
        const newDay = state.days.filter(day => day.appointments.includes(action.id))[0];

        if (!(state.appointments[action.id].interview && action.interview)) {
          if (action.interview) {
            console.log("Appointment contains an interview... decrementing")
            newDay.spots--
          } else {
            console.log("Appointment does not contain an interview... incrementing")
            newDay.spots++
          }
        }

        const days = state.days

        days.map(day => {
          if (day.id === newDay.id) {
            day = newDay
          }
        })

        const interview = action.interview ? { ...action.interview } : null;

        const appointment = {
          ...state.appointments[action.id],
          interview,
        };

        const appointments = {
          ...state.appointments,
          [action.id]: appointment,
        };

        return { ...state, appointments, days }
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

  const setDay = day => dispatch({ type: SET_DAY, day });

  const bookInterview = (id, interview, type) => {
    return axios.put(`/api/appointments/${id}`, { interview })
  }

  const cancelInterview = (id) => {
    return axios.delete(`/api/appointments/${id}`)
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

    dispatch({ type: SET_APPLICATION_DATA, ...state, appointmentsForDay });
  }, [state.day]);

  useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:8001");
    console.log("Incoming websocket message")

    webSocket.onmessage = event => {
      const appointment = JSON.parse(event.data)

      if (appointment.type === "SET_INTERVIEW") {
        dispatch(appointment);
      }
    }
  }, [dispatch]);

  return { state, setDay, bookInterview, cancelInterview };
}