const fmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

/** "5 November 2026", or '' when there is no date. */
export const formatDate = (value) => (value ? fmt.format(new Date(value)) : '');
