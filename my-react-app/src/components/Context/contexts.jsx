import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();
const EventsContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function useEvents() {
  return useContext(EventsContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  return (
    <EventsContext.Provider value={{ events, setEvents }}>
      {children}
    </EventsContext.Provider>
  );
}
