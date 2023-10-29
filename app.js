const pokeAPIBaseURL = "https://pokeapi.co/api/v2/pokemon/";
const game = document.getElementById('game');

function handleGameWin() {
    const victoryMessage = document.querySelector('.victory-message');
    victoryMessage.style.display = 'block';
}

let isPaused = false;
let firstPick;
let matches;


const colors = {
	fire: '#FDDFDF',
	grass: '#DEFDE0',
	electric: '#FCF7DE',
	water: '#DEF3FD',
	ground: '#f4e7da',
	rock: '#d5d5d4',
	fairy: '#fceaff',
	poison: '#98d7a5',
	bug: '#f8d5a3',
	dragon: '#97b3e6',
	psychic: '#eaeda1',
	flying: '#F5F5F5',
	fighting: '#E6E0D4',
	normal: '#F5F5F5'
};

const loadPokemon = async () => {
    const randomIds = new Set();
    while(randomIds.size < 8){
        const randomNumber = Math.ceil(Math.random() * 385); //first 3 gens
        randomIds.add(randomNumber);
    } 
    const pokePromises = [...randomIds].map( id => fetch(pokeAPIBaseURL + id));
    const responses = await Promise.all(pokePromises);
    return await Promise.all(responses.map(res => res.json()));
}

const displayPokemon = (pokemon) => {
    pokemon.sort(_ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
        const type = pokemon.types[0]?.type?.name;
        const color = colors[type] ||'#F5F5F5';
        return `
          <div class="card" onclick="clickCard(event)" data-pokename="${pokemon.name}" style="background-color:${color};">
            <div class="front ">
            </div>
            <div class="back rotated" style="background-color:${color};">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" style="max-width: 100%; max-height: 100%; object-fit: cover; display: block; margin: 0 auto; position: relative; top: 50%; transform: translateY(-50%);"/>
            <h2>${pokemon.name}</h2>
            </div>
        </div>
    `}).join('');
    game.innerHTML = pokemonHTML;
}

const clickCard = (event) => {
    const pokemonCard = event.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard);

    const victoryMessage = document.querySelector('.victory-message');
    const matchMessage = document.querySelector('.match-message');
    const matchedPokemonName = document.getElementById('matched-pokemon-name');

    if (front.classList.contains("rotated") || isPaused) return;

    isPaused = true;

    rotateElements([front, back]);

    if (!firstPick) {
        firstPick = pokemonCard;
        isPaused = false;
    } else {
        const secondPokemonName = pokemonCard.dataset.pokename;
        const firstPokemonName = firstPick.dataset.pokename;
        if (firstPokemonName !== secondPokemonName) {
            const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
            pokemonCard.classList.add('shake');
            firstPick.classList.add('shake')
            setTimeout(() =>{
                pokemonCard.classList.remove('shake');
                firstPick.classList.remove('shake');

                rotateElements([front, back, firstFront, firstBack]);
                firstPick = null;
                isPaused = false;
            }, 500);
        } else {
            matches++;
            if (matches !== 8) {
                matchMessage.style.display = 'block';
                matchedPokemonName.textContent = firstPokemonName;
                pokemonCard.classList.add('pulse');
                firstPick.classList.add('pulse');

                setTimeout(() => {
                    matchMessage.style.display = 'none';
                    pokemonCard.classList.remove('pulse');
                    firstPick.classList.remove('pulse');
                }, 1000); }
            if(matches === 8){
                handleGameWin();
            }
            firstPick = null;
            isPaused = false;    
        }
    }
}

const rotateElements = (elements) => {
    if(typeof elements !== 'object' || !elements.length) return;

    elements.forEach(element => element.classList.toggle('rotated'));
}

const getFrontAndBackFromCard = (card) => {
    const front = card.querySelector(".front");
    const back = card.querySelector(".back");
    return [front, back]
}

const resetGame = () => {
    game.innerHTML = '';
    isPaused = true;
    firstPick = null;
    matches = 0;
    const victoryMessage = document.querySelector('.victory-message');
    victoryMessage.style.display = 'none';
    
    setTimeout(async() => {
        const pokemon = await loadPokemon();
        displayPokemon([...pokemon, ...pokemon]);
        isPaused = false;
        card.classList.remove('pulse');
    },200)

}

resetGame();