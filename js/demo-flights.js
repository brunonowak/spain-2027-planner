// Sample flight data for demo mode only. Real flights are loaded privately via setup.html.
export const DEMO_FLIGHTS = {
  sections: [
    { title: 'Outbound · Tue Apr 20', legs: [
      { flight: 'XX100', route: 'SEA → CDG', depart: 'Apr 20, 1:30pm', arrive: 'Apr 21', cabin: 'Business', seats: '—' },
      { flight: 'XX200', route: 'CDG → MAD', depart: 'Apr 21', arrive: 'Apr 21, 3:35pm', cabin: 'Business', seats: '—' },
    ] },
    { title: 'Return · Thu May 6', legs: [
      { flight: 'XX300', route: 'MAD → AMS', depart: 'May 6, 10:25am', arrive: 'May 6', cabin: 'Business', seats: '—' },
      { flight: 'XX400', route: 'AMS → SEA', depart: 'May 6', arrive: 'May 6, 4:20pm', cabin: 'Business', seats: '—' },
    ] },
  ],
  notes: ['Demo data — the real flights appear here once loaded.'],
};
