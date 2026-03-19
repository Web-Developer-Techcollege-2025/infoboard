export const glitch = () => {
    const container = document.createElement("div")
    
    function start() {
        console.clear();
    
        setInterval(function () {
            let line = "";
    
            for (let i = 0; i < 11; i++) {
                line += Math.floor(Math.random() * 100) + " ";
            }
            container.innerText = line;
            console.log(line);
        }, 100);
    }
    
    start();

    return container;
}
