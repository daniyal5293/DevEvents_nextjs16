'use client';

import { FormEvent, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

const CreateEventForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [agendaItems, setAgendaItems] = useState<string[]>(['']);
  const [tagItems, setTagItems] = useState<string[]>(['']);

  const handleAgendaChange = (index: number, value: string) => {
    const newAgenda = [...agendaItems];
    newAgenda[index] = value;
    setAgendaItems(newAgenda);
  };

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, '']);
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...tagItems];
    newTags[index] = value;
    setTagItems(newTags);
  };

  const addTagItem = () => {
    setTagItems([...tagItems, '']);
  };

  const removeTagItem = (index: number) => {
    setTagItems(tagItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);

      // Filter out empty agenda and tag items
      const agenda = agendaItems.filter(item => item.trim() !== '');
      const tags = tagItems.filter(item => item.trim() !== '');

      if (agenda.length === 0) {
        setError('Please add at least one agenda item');
        setLoading(false);
        return;
      }

      if (tags.length === 0) {
        setError('Please add at least one tag');
        setLoading(false);
        return;
      }

      // Create slug from title
      const title = formData.get('title') as string;
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      formData.set('agenda', JSON.stringify(agenda));
      formData.set('tags', JSON.stringify(tags));
      formData.set('slug', slug);

      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          const errorMessages = Object.values(data.fieldErrors).join('\n');
          setError(errorMessages as string);
        } else if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join('\n'));
        } else {
          setError(data.message || 'Failed to create event');
        }
        setLoading(false);
        return;
      }

      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div id="create-event-form">
      <h1>Create New Event</h1>
      {error && (
        <div className="error-message" style={{ whiteSpace: 'pre-wrap' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter event title"
            maxLength={100}
            required
            className={fieldErrors.title ? 'input-error' : ''}
          />
          {fieldErrors.title && <span className="field-error-message">{fieldErrors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Event Image *</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter detailed description"
            maxLength={1000}
            required
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="overview">Overview *</label>
          <textarea
            id="overview"
            name="overview"
            placeholder="Enter brief overview"
            maxLength={500}
            required
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="venue">Venue *</label>
          <input
            type="text"
            id="venue"
            name="venue"
            placeholder="Enter venue name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Enter location (city, state)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="text"
            id="date"
            name="date"
            placeholder="e.g., March 15, 2024"
            required
            className={fieldErrors.date ? 'input-error' : ''}
          />
          {fieldErrors.date && <span className="field-error-message">{fieldErrors.date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="time">Time *</label>
          <input
            type="text"
            id="time"
            name="time"
            placeholder="e.g., 9:00 AM or 9:00 AM - 6:00 PM"
            required
            className={fieldErrors.time ? 'input-error' : ''}
          />
          {fieldErrors.time && <span className="field-error-message">{fieldErrors.time}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mode">Event Mode *</label>
          <select 
            id="mode" 
            name="mode" 
            required
            className={fieldErrors.mode ? 'input-error' : ''}
          >
            <option value="">Select event mode</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {fieldErrors.mode && <span className="field-error-message">{fieldErrors.mode}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="audience">Target Audience *</label>
          <input
            type="text"
            id="audience"
            name="audience"
            placeholder="e.g., Developers, Students, Professionals"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizer">Organizer *</label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            placeholder="Enter organizer name"
            required
          />
        </div>

        <div className="form-group">
          <label>Agenda Items *</label>
          {agendaItems.map((item, index) => (
            <div key={index} className="array-item">
              <input
                type="text"
                value={item}
                onChange={(e) => handleAgendaChange(index, e.target.value)}
                placeholder={`Agenda item ${index + 1}`}
              />
              {agendaItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAgendaItem(index)}
                  className="btn-remove"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAgendaItem} className="btn-add">
            + Add Agenda Item
          </button>
        </div>

        <div className="form-group">
          <label>Tags *</label>
          {tagItems.map((item, index) => (
            <div key={index} className="array-item">
              <input
                type="text"
                value={item}
                onChange={(e) => handleTagChange(index, e.target.value)}
                placeholder={`Tag ${index + 1}`}
              />
              {tagItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTagItem(index)}
                  className="btn-remove"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addTagItem} className="btn-add">
            + Add Tag
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-submit"
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEventForm;
