export function accessGranted(currPage) {
    const body = document.querySelector('body');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const heading = document.querySelector('h1');


    if (window.innerWidth > 480) {
        body.style.flexDirection = 'row';
        header.style.width = '25%';
        header.style.height = 'auto';
        header.style.padding = '0';
        header.style.alignItems = 'center';
        heading.style.fontSize = "min(20vw, 5rem)";
    }

    main.removeChild(main.firstChild);
    

    const app = document.createElement('div');
    app.classList.add('app');

    const prompt = document.createElement('h4');
    prompt.textContent = '1. Select your playlists, and shuffle \'em together!';

    app.appendChild(prompt);  
}