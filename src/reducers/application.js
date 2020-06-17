const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

export { SET_DAY, SET_APPLICATION_DATA, SET_INTERVIEW }

export default function reducer(state, action) {
  switch (action.type) {
    case SET_DAY:
      return { ...state, ...action.payload };
    case SET_APPLICATION_DATA:
      return { ...state, ...action.payload };
    case SET_INTERVIEW:
      let newDay = state.days.filter(day => day.appointments.includes(action.id))[0];

      if (!(state.appointments[action.id].interview && action.interview)) {
        if (action.interview) {
          newDay.spots--;
        } else {
          newDay.spots++;
        }
      }

      const days = state.days;

      days.map(day => {
        if (day.id === newDay.id) {
          day = newDay;
        }
      });

      const interview = action.interview ? { ...action.interview } : null;

      const appointment = {
        ...state.appointments[action.id],
        interview
      };

      const appointments = {
        ...state.appointments,
        [action.id]: appointment
      };

      return { ...state, appointments, days };
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}