import CreateEventForm from '@/components/CreateEventForm';

export const metadata = {
  title: 'Create Event - DevEvents',
  description: 'Create a new event on DevEvents platform',
};

export default function CreateEventPage() {
  return (
    <section>
      <CreateEventForm />
    </section>
  );
}
