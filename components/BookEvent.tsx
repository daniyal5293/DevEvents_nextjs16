'use client'
import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string;}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { success } = await createBooking({ eventId, slug, email });

        if(success) {
            setSubmitted(true);

        } else {
            console.error('Booking creation failed')
            
        }
    }


    return (
        <div id="book-event">
            {submitted ? (
                <p>Thank you for booking! A confirmation email has been sent to {email}.</p>
            ) : (

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" >Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <button type="submit" className="button-submit">Book Event</button>
                </form>
            )}
        </div>
    )
}
export default BookEvent;