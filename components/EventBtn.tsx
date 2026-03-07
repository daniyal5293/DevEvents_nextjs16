'use client';

const EventBtn = () => {
  return (
    <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={() => {console.log("clicked")}}>
        <a href="#events">
            Explore Events <img src="/icons/arrow-down.svg" alt="arrow down" height={24} width={24} />
        </a>
    </button>
  );
}
export default EventBtn;