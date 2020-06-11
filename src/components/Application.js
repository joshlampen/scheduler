import React, { useState, useEffect } from "react";
import axios from "axios";

import Button from "components/Button";
import DayListItem from "components/DayListItem";
import DayList from "components/DayList";
import Appointment from "components/Appointment";
import { getAppointmentsForDay, getInterviewersForDay, getInterview } from "helpers/selectors";
import useVisualMode from "hooks/useVisualMode";

import "components/Application.scss";

export default function Application(props) {
  const [interviewer, setInterviewer] = useState();

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
    appointmentsForDay: [],
  });

  const setDay = day => setState({ ...state, day });

  const bookInterview = (id, interview) => {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    setState({ ...state, appointments });
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

      setState(prev => ({ ...state, days, appointments, interviewers, appointmentsForDay }));
    });
  }, []);

  useEffect(() => {
    setState(prev => ({ ...state, appointmentsForDay: getAppointmentsForDay(state.days, state.appointments, state.day) }))
  }, [state.day]);

  return (
    <main className="layout">
      <section className="sidebar">
        <img
          className="sidebar--centered"
          src="images/logo.png"
          alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
          <DayList
            days={state.days}
            day={state.day}
            setDay={setDay}
          />
        </nav>
        <img
          className="sidebar__lhl sidebar--centered"
          src="images/lhl.png"
          alt="Lighthouse Labs"
        />
      </section>
      <section className="schedule">
        {state.appointmentsForDay.map(appointment => (
          <Appointment
            key={appointment.id}
            {...appointment}
            interview={getInterview(state, appointment.interview)}
            interviewers={getInterviewersForDay(state.days, state.interviewers, state.day)}
            bookInterview={bookInterview}
          />
        ))}
      </section>
    </main>
  );
}
