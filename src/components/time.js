export function time(date = new Date()) {
    const currentTime = date.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return currentTime;
}
