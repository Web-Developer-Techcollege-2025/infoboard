export function date(date = new Date()) {
    const currentDate = date.toLocaleDateString('da-DK', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    return currentDate;
}
