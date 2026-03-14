import CreateEventForm from '@/components/CreateEventForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Create Event - DevEvents',
  description: 'Create a new event on DevEvents platform',
};

export default function CreateEventPage() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
         <CreateEventForm />
      </Suspense>
  );
}
