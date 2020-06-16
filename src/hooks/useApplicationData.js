import React, { useReducer, useEffect } from "react";
import axios from "axios";
import { getAppointmentsForDay } from "helpers/selectors";
import reducer, { SET_DAY, SET_APPLICATION_DATA, SET_INTERVIEW } from "reducers/application";

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
    appointmentsForDay: [],
  });

  const setDay = day => dispatch({
    type: SET_DAY,
    payload: { day }
  });

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

      dispatch({
        type: SET_APPLICATION_DATA,
        payload: {
          days,
          appointments,
          interviewers,
          appointmentsForDay
        }
      });
    })
  }, []);

  useEffect(() => {
    const appointmentsForDay = getAppointmentsForDay(state.days, state.appointments, state.day);

    dispatch({
      type: SET_APPLICATION_DATA,
      payload: { appointmentsForDay }
    });
  }, [state.day]);

  useEffect(() => {
    const webSocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    webSocket.onmessage = event => {
      const appointment = JSON.parse(event.data)

      if (appointment.type === "SET_INTERVIEW") {
        dispatch(appointment);
      }
    }
  }, [dispatch]);

  return { state, setDay, bookInterview, cancelInterview };
}