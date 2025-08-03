import React, { useState, useEffect } from 'react';

interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
}

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Event>({ id: 0, title: '', date: '', description: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    // Fetch events from an API or database
    const response = await fetch('/api/events');
    const data = await response.json();
    setEvents(data);
  };

  const createEvent = async () => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
    if (response.ok) {
      fetchEvents();
      setNewEvent({ id: 0, title: '', date: '', description: '' });
    }
  };

  const deleteEvent = async (id: number) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const updateEvent = async () => {
    const response = await fetch(`/api/events/${newEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
    if (response.ok) {
      fetchEvents();
      setNewEvent({ id: 0, title: '', date: '', description: '' });
    }
  };

  return (
    <div>
      <h1>Event Management</h1>
      <h2>Create Event</h2>
      <input
        type="text"
        value={newEvent.title}
        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
        placeholder="Event Title"
      />
      <input
        type="date"
        value={newEvent.date}
        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
      />
      <textarea
        value={newEvent.description}
        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
        placeholder="Event Description"
      />
      <button onClick={newEvent.id ? updateEvent : createEvent}>
        {newEvent.id ? 'Update Event' : 'Create Event'}
      </button>

      <h2>Event List</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h3>{event.title}</h3>
            <p>{event.date}</p>
            <p>{event.description}</p>
            <button onClick={() => setNewEvent(event)}>Edit</button>
            <button onClick={() => deleteEvent(event.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventManagement;