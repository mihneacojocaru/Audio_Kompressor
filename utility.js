let footer = document.querySelector('footer');
let btn = document.querySelector('button');
footer.addEventListener('click', ()=>{
    footer.style.display = 'none';
});

btn.addEventListener('click', ()=>{
    footer.style.display = 'flex';
})