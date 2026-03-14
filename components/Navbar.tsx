'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { IEvent } from "@/database";

const Navbar = () => {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/events');
                const data = await response.json();
                setEvents(data.events || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch events when dropdown is about to open
        if (isDropdownOpen && events.length === 0) {
            fetchEvents();
        }
    }, [isDropdownOpen, events.length]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <header>
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" alt="logo" height={24} width={24} />
                    <p>DevEvents</p>
                </Link>

                <ul>
                    <li><Link href="/">Home</Link></li>
                    
                    {/* Events Dropdown */}
                    <li>
                        <div ref={dropdownRef} className="dropdown-container">
                            <button
                                className="dropdown-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                Events
                                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {loading ? (
                                        <div className="dropdown-item">Loading events...</div>
                                    ) : events.length === 0 ? (
                                        <div className="dropdown-item">No events available</div>
                                    ) : (
                                        <ul>
                                            {events.map((event) => (
                                                <li key={String(event._id) || event.slug}>
                                                    <Link
                                                        href={`/events/${event.slug}`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="dropdown-event-link"
                                                    >
                                                        <span className="event-title">{event.title}</span>
                                                        <span className="event-date">{event.date}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </li>

                    <li><Link href="/create-event">Create Event</Link></li>
                </ul>
            </nav>
        </header>
    )
}
export default Navbar;