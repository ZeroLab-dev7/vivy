const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');
const axios = require('axios');
const UI = require('./ui');

// Fallback lists of safe high-quality GIFs
const INTERACTION_GIFS = {
    pat: ['https://media.tenor.com/DMgCwQj96hIAAAAC/anime-head-pat.gif', 'https://media.tenor.com/b545d9zZ478AAAAC/anime-pat.gif'],
    poke: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-poke.gif', 'https://media.tenor.com/3910cR2p84IAAAAC/anime-poke.gif'],
    tickle: ['https://media.tenor.com/1YedZssZ448AAAAC/anime-tickle.gif', 'https://media.tenor.com/S9sJ1dC548AAAAAC/anime-tickle.gif'],
    cuddle: ['https://media.tenor.com/27G4J4C548AAAAAC/anime-cuddle.gif', 'https://media.tenor.com/S9sJdC548AAAAAC/anime-cuddle.gif'],
    highfive: ['https://media.tenor.com/y4W43gr5C5YAAAAC/high-five-anime.gif'],
    handshake: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-handshake.gif'],
    wave: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-wave.gif'],
    bonk: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-bonk.gif'],
    bite: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-bite.gif'],
    feed: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-feed.gif'],
    boop: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-boop.gif'],
    holdhands: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-holding-hands.gif'],
    punch: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-punch.gif'],
    kick: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-kick.gif'],
    stare: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-stare.gif'],
    blush: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-blush.gif'],
    cry: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-cry.gif'],
    laugh: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-laugh.gif'],
    facepalm: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-facepalm.gif'],
    sleep: ['https://media.tenor.com/y4W43gr5C5YAAAAC/anime-sleep.gif']
};

const INTERACTION_TEMPLATES = {
    pat: '**{author}** gently pats **{target}** on the head! 🐾',
    poke: '**{author}** pokes **{target}**! Hey! 👉',
    tickle: '**{author}** tickles **{target}**! Too ticklish! 😂',
    cuddle: '**{author}** cuddles **{target}** warm and cozy! 🤗',
    highfive: '**{author}** highfives **{target}**! Yeah! ✋',
    handshake: '**{author}** shakes hands with **{target}**! Nice to meet you. 🤝',
    wave: '**{author}** waves at **{target}**! Hello! 👋',
    bonk: '**{author}** bonks **{target}**! Go to horny jail! 🔨',
    bite: '**{author}** bites **{target}**! Ouch! 🦷',
    feed: '**{author}** feeds **{target}** some delicious treats! 🍰',
    boop: '**{author}** boops **{target}**\'s nose! Boop! 👃',
    holdhands: '**{author}** holds hands with **{target}**! So sweet! 💞',
    punch: '**{author}** punches **{target}**! Oof! 👊',
    kick: '**{author}** kicks **{target}**! Ouch! 🦵',
    stare: '**{author}** stares deeply at **{target}**... 👀',
    blush: '**{author}** blushes! So embarrassing... 😳',
    cry: '**{author}** cries... T_T 😭',
    laugh: '**{author}** laughs out loud! Hahaha! 😂',
    facepalm: '**{author}** facepalms... Oh dear. 🤦',
    sleep: '**{author}** falls asleep... Zzz 😴'
};

const JOKES = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "Why don't skeletons fight each other? They don't have the guts.",
    "What do you call a fake noodle? An impasta!",
    "Why did the bicycle fall over? Because it was two tired!"
];

const FACTS = [
    "Honey never spoils. You could theoretically eat 3,000-year-old honey.",
    "Bananas are berries, but strawberries aren't.",
    "Wombat poop is cube-shaped, which stops it from rolling away.",
    "Octopuses have three hearts and blue blood.",
    "A day on Venus is longer than a year on Venus."
];

const QUOTES = [
    "Be yourself; everyone else is already taken. - Oscar Wilde",
    "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. - Albert Einstein",
    "Be the change that you wish to see in the world. - Mahatma Gandhi",
    "In the middle of difficulty lies opportunity. - Albert Einstein"
];

const ANIME_QUOTES = [
    { text: "If you don't like your destiny, don't accept it. Instead, have the courage to change it.", char: "Naruto Uzumaki", anime: "Naruto" },
    { text: "In this world, wherever there is light - there are also shadows.", char: "Madara Uchiha", anime: "Naruto" },
    { text: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", char: "Kenshin Himura", anime: "Rurouni Kenshin" },
    { text: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger.", char: "Gildarts Clive", anime: "Fairy Tail" }
];

const PICKUPLINES = [
    "Are you a magician? Because whenever I look at you, everyone else disappears!",
    "Are you keyboard? Because you are just my type.",
    "Do you have a map? I keep getting lost in your eyes.",
    "Do you believe in love at first sight, or should I walk by again?"
];

// Canvas game rendering functions
function drawSlotsCanvas(spin, isWin) {
    const W = 500, H = 250;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1a0c2e');
    bg.addColorStop(1, '#0c0414');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    ctx.fillStyle = '#222222';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(60 + i * 135, 60, 110, 110);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(60 + i * 135, 60, 110, 110);

        ctx.fillStyle = '#ffffff';
        ctx.font = '55px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(spin[i], 60 + i * 135 + 55, 60 + 55);
    }

    ctx.fillStyle = isWin ? '#2ecc71' : '#e74c3c';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isWin ? '🎰 JACKPOT! YOU WIN! 🎰' : '<:no:1526496561188831244>TRY AGAIN! ❌', W / 2, 215);

    return canvas.toBuffer('image/png');
}

function drawRpsCanvas(playerChoice, botChoice, result) {
    const W = 600, H = 250;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const emojiMap = { rock: '🪨', paper: '📄', scissors: '✂️' };

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, 50, 150, 130);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(50, 50, 150, 130);

    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emojiMap[playerChoice], 125, 115);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('YOU', 125, 160);

    ctx.save();
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 15;
    ctx.font = 'italic bold 40px sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('VS', 300, 115);
    ctx.restore();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(400, 50, 150, 130);
    ctx.strokeStyle = '#ec4899';
    ctx.strokeRect(400, 50, 150, 130);

    ctx.font = '60px sans-serif';
    ctx.fillText(emojiMap[botChoice], 475, 115);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ec4899';
    ctx.fillText('VIVY', 475, 160);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(result, W / 2, 215);

    return canvas.toBuffer('image/png');
}

function drawRouletteCanvas(playerBet, winningColor, isWin) {
    const W = 500, H = 250;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#064e3b');
    bg.addColorStop(1, '#022c22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(120, 125, 80, 0, Math.PI * 2);
    ctx.stroke();

    const colorHex = { red: '#ef4444', black: '#1e293b', green: '#10b981' };
    ctx.fillStyle = colorHex[winningColor];
    ctx.beginPath();
    ctx.arc(120, 125, 77, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(winningColor.toUpperCase(), 120, 125);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Your Bet: ${playerBet.toUpperCase()}`, 240, 95);
    ctx.fillText(`Result: ${winningColor.toUpperCase()}`, 240, 135);

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = isWin ? '#34d399' : '#f87171';
    ctx.fillText(isWin ? '<a:pink8:1337678972108148757> YOU WIN! <a:pink8:1337678972108148757>' : '😢 YOU LOSE', 240, 185);

    return canvas.toBuffer('image/png');
}

function drawBlackjackCanvas(playerHand, dealerHand, playerScore, dealerScore, ended) {
    const W = 600, H = 300;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f5132';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#d3a243';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    const drawCard = (x, y, card, isHidden) => {
        ctx.fillStyle = isHidden ? '#7f1d1d' : '#ffffff';
        ctx.fillRect(x, y, 70, 100);
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 70, 100);

        if (isHidden) {
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 5, y + 5, 60, 90);
            return;
        }

        const isRed = ['♥', '♦'].includes(card.suit);
        ctx.fillStyle = isRed ? '#ef4444' : '#111827';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(card.val, x + 35, y + 45);
        ctx.font = '28px sans-serif';
        ctx.fillText(card.suit, x + 35, y + 80);
    };

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`DEALER (Score: ${ended ? dealerScore : '?'})`, 50, 45);
    dealerHand.forEach((c, idx) => {
        const isHidden = !ended && idx === 1;
        drawCard(50 + idx * 80, 60, c, isHidden);
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`YOU (Score: ${playerScore})`, 50, 185);
    playerHand.forEach((c, idx) => {
        drawCard(50 + idx * 80, 200, c, false);
    });

    return canvas.toBuffer('image/png');
}

// Resolves deterministic hash
function getDeterministicRating(id1, id2, seed) {
    const combined = [id1, id2].sort().join('') + ':' + seed;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

/**
 * Handle Anime / GIF loading
 */
async function fetchOtakuGif(action) {
    try {
        const res = await axios.get(`https://api.otakugifs.xyz/gif?reaction=${action}`, { timeout: 1500 });
        if (res.data && res.data.url) return res.data.url;
    } catch { }
    const list = INTERACTION_GIFS[action] || [];
    return list[Math.floor(Math.random() * list.length)] || '';
}

/**
 * Base execution for 20 interaction commands
 */
async function handleInteraction(context, action, targetUser) {
    const author = context.author || context.user;

    const selfActions = ['wave', 'blush', 'cry', 'laugh', 'facepalm', 'sleep'];
    const isSelfAction = selfActions.includes(action);

    if (!targetUser && !isSelfAction) {
        const warnEmbed = UI.createEmbed({ type: 'warning', description: 'Please mention someone to interact with!' });
        return replyOrEdit(context, { embeds: [warnEmbed] });
    }

    if (targetUser && targetUser.id === author.id && !isSelfAction) {
        const warnEmbed = UI.createEmbed({ type: 'warning', description: `You can't ${action} yourself! Tag someone else.` });
        return replyOrEdit(context, { embeds: [warnEmbed] });
    }

    const gifUrl = await fetchOtakuGif(action);
    let desc = INTERACTION_TEMPLATES[action]
        .replace('{author}', author.username)
        .replace('{target}', targetUser ? targetUser.username : 'the void');

    const container = UI.createContainer({
        title: `✨ ${action.toUpperCase()}`,
        description: desc,
        image: gifUrl || undefined
    });

    await replyOrEdit(context, {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

/**
 * Base execution for Rating commands
 */
async function handleRating(context, action, targetUser) {
    const author = context.author || context.user;
    const target = targetUser || author;
    const rateVal = getDeterministicRating(target.id, '', action) % 101;

    let description = '';
    let title = `${action.toUpperCase()} Machine`;

    if (action === 'aura') {
        const aura = (getDeterministicRating(target.id, '', 'aura') % 20001) - 10000;
        description = `${target} has **${aura.toLocaleString()}** Aura points! ${aura >= 0 ? '🟢' : '🔴'}`;
    } else if (action === 'rizz') {
        let rizzTitle = 'L Rizz';
        if (rateVal > 85) rizzTitle = 'W Rizz (Rizzler)';
        else if (rateVal > 50) rizzTitle = 'Unspoken Rizz';
        description = `${target}'s Rizz: **${rateVal}%** [${rizzTitle}]`;
    } else if (action === 'drip') {
        description = `${target}'s Drip: **${rateVal}%** ${rateVal > 75 ? '💧 drippy!' : '👟 average.'}`;
    } else if (action === 'ppsize') {
        const size = (getDeterministicRating(target.id, '', 'ppsize') % 12) + 1;
        const middle = '='.repeat(size);
        description = `${target}'s size: 8${middle}D (${size} inches)`;
    } else {
        description = `${target} is **${rateVal}%** ${action}!`;
    }

    const container = UI.createContainer({
        title: `📊 ${title}`,
        description,
        thumbnail: target.displayAvatarURL({ extension: 'png' })
    });

    await replyOrEdit(context, {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

/**
 * Base execution for Social/Relationship commands
 */
async function handleSocial(context, action, targetUser, targetUser2) {
    const author = context.author || context.user;
    const u1 = targetUser || author;
    const u2 = targetUser2 || (targetUser ? author : null);

    if (!u2) {
        const warnEmbed = UI.createEmbed({ type: 'warning', description: 'Please mention another user to calculate compatibility!' });
        return replyOrEdit(context, { embeds: [warnEmbed] });
    }

    if (u1.id === u2.id) {
        const warnEmbed = UI.createEmbed({ type: 'warning', description: 'Compatibility with yourself is always 100%!' });
        return replyOrEdit(context, { embeds: [warnEmbed] });
    }

    const rate = getDeterministicRating(u1.id, u2.id, action) % 101;
    let description = '';

    if (action === 'ship') {
        const filled = Math.round(rate / 10);
        const bar = '💖'.repeat(filled) + '💔'.repeat(10 - filled);
        description = `⚡ Shipping **${u1.username}** & **${u2.username}**:\n**${rate}%** match!\n\n${bar}`;
    } else if (action === 'friendship') {
        description = `👥 Friendship compatibility between **${u1.username}** & **${u2.username}** is **${rate}%**!`;
    } else if (action === 'soulmate') {
        description = `🔮 Soulmate match between **${u1.username}** & **${u2.username}** is **${rate}%**!`;
    } else if (action === 'compatibility') {
        description = `📈 General Compatibility: **${rate}%**\n- Trust: \`${rate}%\`\n- Communication: \`${(rate + 12) % 101}%\`\n- Humor: \`${(rate + 37) % 101}%\``;
    } else if (action === 'adopt') {
        description = `👪 **${u1.username}** has successfully adopted **${u2.username}**! Welcome to the family! <a:pink8:1337678972108148757>`;
    }

    const container = UI.createContainer({
        title: `💞 Relationship Resolver`,
        description
    });

    await replyOrEdit(context, {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

/**
 * Base execution for Random/Text commands
 */
async function handleRandom(context, action, query) {
    let title = action.toUpperCase();
    let val = '';

    if (action === '8ball') {
        if (!query) {
            return replyOrEdit(context, { embeds: [UI.createEmbed({ type: 'warning', description: 'Please ask a question!' })] });
        }
        const answers = ["Yes", "It is certain", "Reply hazy, try again", "Don't count on it", "My sources say no", "Very doubtful", "Absolutely!"];
        val = `**Question:** ${query}\n**8Ball:** ${answers[Math.floor(Math.random() * answers.length)]}`;
    } else if (action === 'choose') {
        if (!query) return replyOrEdit(context, { embeds: [UI.createEmbed({ type: 'warning', description: 'Please specify choices (e.g. choose red, blue)' })] });
        const choices = query.split(',').map(c => c.trim()).filter(Boolean);
        if (choices.length < 2) return replyOrEdit(context, { embeds: [UI.createEmbed({ type: 'warning', description: 'Please specify at least 2 choices separated by commas!' })] });
        val = `I choose: **${choices[Math.floor(Math.random() * choices.length)]}**`;
    } else if (action === 'coinflip') {
        const side = Math.random() < 0.5 ? 'Heads' : 'Tails';
        val = `🪙 Tossed a coin and got: **${side}**!`;
    } else if (action === 'fortune') {
        const fortunes = ["You will find great success in coding.", "Watch out for bugs in your code.", "A mystery visitor will arrive shortly.", "A double-cooldown is in your future."];
        val = fortunes[Math.floor(Math.random() * fortunes.length)];
    } else if (action === 'joke') {
        val = JOKES[Math.floor(Math.random() * JOKES.length)];
    } else if (action === 'fact') {
        val = FACTS[Math.floor(Math.random() * FACTS.length)];
    } else if (action === 'quote') {
        val = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    } else if (action === 'animequote') {
        const quoteObj = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
        val = `*"${quoteObj.text}"*\n\n— **${quoteObj.char}** (${quoteObj.anime})`;
    } else if (action === 'pickupline') {
        val = PICKUPLINES[Math.floor(Math.random() * PICKUPLINES.length)];
    }

    const container = UI.createContainer({
        title: `🎲 ${title}`,
        description: val
    });

    await replyOrEdit(context, {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

/**
 * Base execution for Animal commands
 */
async function handleAnimal(context, animal) {
    const urls = {
        dog: 'https://dog.ceo/api/breeds/image/random',
        fox: 'https://randomfox.ca/floof/',
        duck: 'https://random-d.uk/api/v2/random',
        panda: 'https://some-random-api.com/animal/panda',
        bird: 'https://some-random-api.com/animal/bird',
        meme: 'https://meme-api.com/gimme'
    };

    let imgUrl = '';
    try {
        const res = await axios.get(urls[animal], { timeout: 2000 });
        if (animal === 'dog') imgUrl = res.data.message;
        else if (animal === 'fox') imgUrl = res.data.image;
        else if (animal === 'duck') imgUrl = res.data.url;
        else if (animal === 'panda' || animal === 'bird') imgUrl = res.data.image;
        else if (animal === 'meme') imgUrl = res.data.url;
    } catch { }

    // Fallbacks if API offline
    if (!imgUrl) {
        const fallbacks = {
            dog: 'https://images.dog.ceo/breeds/terrier-irish/n02093991_423.jpg',
            fox: 'https://randomfox.ca/images/1.jpg',
            duck: 'https://random-d.uk/lgt/d/001.jpg',
            panda: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7',
            bird: 'https://images.unsplash.com/photo-1470115636472-747011700b44',
            meme: 'https://i.redd.it/meme-fallback.jpg'
        };
        imgUrl = fallbacks[animal];
    }

    const container = UI.createContainer({
        title: `🐾 ${animal.toUpperCase()}`,
        image: imgUrl
    });

    await replyOrEdit(context, {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

/**
 * Interactive Games Execution
 */
async function handleGame(context, game) {
    const author = context.author || context.user;

    if (game === 'rps') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rps_rock').setLabel('Rock').setEmoji('🪨').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('rps_paper').setLabel('Paper').setEmoji('📄').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('rps_scissors').setLabel('Scissors').setEmoji('✂️').setStyle(ButtonStyle.Primary)
        );

        const container = UI.createContainer({
            title: '🎮 Rock Paper Scissors',
            description: 'Click a button below to choose your weapon!'
        });

        container.addActionRowComponents(row);

        const msg = await replyOrEdit(context, {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const filter = (i) => i.user.id === author.id;
        const messageObj = context.author ? msg : await context.fetchReply();
        const collector = messageObj.createMessageComponentCollector({ filter, time: 20000, max: 1 });

        collector.on('collect', async (i) => {
            const playerChoice = i.customId.split('_')[1];
            const choices = ['rock', 'paper', 'scissors'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];

            let result = '';
            if (playerChoice === botChoice) result = "It's a tie! 👔";
            else if (
                (playerChoice === 'rock' && botChoice === 'scissors') ||
                (playerChoice === 'paper' && botChoice === 'rock') ||
                (playerChoice === 'scissors' && botChoice === 'paper')
            ) {
                result = 'You won! <a:pink8:1337678972108148757>';
            } else {
                result = 'You lost! 😢';
            }

            const buffer = drawRpsCanvas(playerChoice, botChoice, result);
            const attachment = new AttachmentBuilder(buffer, { name: 'rps.png' });

            const updatedContainer = UI.createContainer({
                title: '🎮 Rock Paper Scissors',
                image: 'attachment://rps.png'
            });

            await i.update({
                components: [updatedContainer],
                files: [attachment],
                flags: MessageFlags.IsComponentsV2
            });
        });
    }

    else if (game === 'slots') {
        const items = ['🍒', '🍋', '🍇', '🍉', '🔔', '7️⃣'];
        const spin = [
            items[Math.floor(Math.random() * items.length)],
            items[Math.floor(Math.random() * items.length)],
            items[Math.floor(Math.random() * items.length)]
        ];

        const isWin = spin[0] === spin[1] && spin[1] === spin[2];
        const buffer = drawSlotsCanvas(spin, isWin);
        const attachment = new AttachmentBuilder(buffer, { name: 'slots.png' });

        const container = UI.createContainer({
            title: '🎰 Slot Machine',
            image: 'attachment://slots.png'
        });

        await replyOrEdit(context, {
            components: [container],
            files: [attachment],
            flags: MessageFlags.IsComponentsV2
        });
    }

    else if (game === 'blackjack') {
        const deck = [];
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        for (const suit of suits) {
            for (const val of values) {
                deck.push({ val, suit });
            }
        }

        const drawCard = () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
        const calcHandValue = (hand) => {
            let total = 0;
            let aces = 0;
            for (const c of hand) {
                if (c.val === 'A') { total += 11; aces++; }
                else if (['J', 'Q', 'K'].includes(c.val)) { total += 10; }
                else { total += parseInt(c.val); }
            }
            while (total > 21 && aces > 0) {
                total -= 10;
                aces--;
            }
            return total;
        };

        const playerHand = [drawCard(), drawCard()];
        const dealerHand = [drawCard(), drawCard()];

        const score = calcHandValue(playerHand);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bj_hit').setLabel('Hit').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('bj_stand').setLabel('Stand').setStyle(ButtonStyle.Danger)
        );

        const initialBuffer = drawBlackjackCanvas(playerHand, dealerHand, score, 0, false);
        const initialAttachment = new AttachmentBuilder(initialBuffer, { name: 'blackjack.png' });

        const container = UI.createContainer({
            title: '🃏 Blackjack',
            image: 'attachment://blackjack.png'
        });

        container.addActionRowComponents(row);

        const msg = await replyOrEdit(context, {
            components: [container],
            files: [initialAttachment],
            flags: MessageFlags.IsComponentsV2
        });

        const filter = (i) => i.user.id === author.id;
        const messageObj = context.author ? msg : await context.fetchReply();
        const collector = messageObj.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'bj_hit') {
                playerHand.push(drawCard());
                const currentScore = calcHandValue(playerHand);

                if (currentScore > 21) {
                    const finalBuffer = drawBlackjackCanvas(playerHand, dealerHand, currentScore, calcHandValue(dealerHand), true);
                    const finalAttachment = new AttachmentBuilder(finalBuffer, { name: 'blackjack.png' });

                    const finalContainer = UI.createContainer({
                        title: '🃏 Blackjack - Busted!',
                        image: 'attachment://blackjack.png'
                    });
                    collector.stop();
                    return i.update({ components: [finalContainer], files: [finalAttachment] });
                }

                const updatedBuffer = drawBlackjackCanvas(playerHand, dealerHand, currentScore, 0, false);
                const updatedAttachment = new AttachmentBuilder(updatedBuffer, { name: 'blackjack.png' });

                const updatedContainer = UI.createContainer({
                    title: '🃏 Blackjack',
                    image: 'attachment://blackjack.png'
                });
                updatedContainer.addActionRowComponents(row);
                await i.update({ components: [updatedContainer], files: [updatedAttachment] });
            }
            else if (i.customId === 'bj_stand') {
                collector.stop();

                let dScore = calcHandValue(dealerHand);
                while (dScore < 17) {
                    dealerHand.push(drawCard());
                    dScore = calcHandValue(dealerHand);
                }

                const pScore = calcHandValue(playerHand);
                const finalBuffer = drawBlackjackCanvas(playerHand, dealerHand, pScore, dScore, true);
                const finalAttachment = new AttachmentBuilder(finalBuffer, { name: 'blackjack.png' });

                let titleResult = 'Blackjack';
                if (dScore > 21) titleResult = 'Blackjack - You Win!';
                else if (pScore > dScore) titleResult = 'Blackjack - You Win!';
                else if (pScore < dScore) titleResult = 'Blackjack - Dealer Wins!';
                else titleResult = 'Blackjack - Push!';

                const finalContainer = UI.createContainer({
                    title: titleResult,
                    image: 'attachment://blackjack.png'
                });

                await i.update({
                    components: [finalContainer],
                    files: [finalAttachment],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        });
    }

    else if (game === 'roulette') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('r_red').setLabel('Red').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('r_black').setLabel('Black').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('r_green').setLabel('Green').setStyle(ButtonStyle.Success)
        );

        const container = UI.createContainer({
            title: '🎡 Roulette',
            description: 'Place your bet color below!'
        });

        container.addActionRowComponents(row);

        const msg = await replyOrEdit(context, {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const filter = (i) => i.user.id === author.id;
        const messageObj = context.author ? msg : await context.fetchReply();
        const collector = messageObj.createMessageComponentCollector({ filter, time: 20000, max: 1 });

        collector.on('collect', async (i) => {
            const playerBet = i.customId.split('_')[1];
            const colors = ['red', 'black', 'green'];
            const wheel = [];
            for (let j = 0; j < 18; j++) { wheel.push('red', 'black'); }
            wheel.push('green', 'green');

            const winningColor = wheel[Math.floor(Math.random() * wheel.length)];
            const isWin = playerBet === winningColor;

            const buffer = drawRouletteCanvas(playerBet, winningColor, isWin);
            const attachment = new AttachmentBuilder(buffer, { name: 'roulette.png' });

            const finalContainer = UI.createContainer({
                title: '🎡 Roulette Result',
                image: 'attachment://roulette.png'
            });

            await i.update({
                components: [finalContainer],
                files: [attachment],
                flags: MessageFlags.IsComponentsV2
            });
        });
    }

    else if (game === 'guess') {
        const secret = Math.floor(Math.random() * 100) + 1;
        const container = UI.createContainer({
            title: '🔢 Number Guessing',
            description: `I've chosen a number between **1 and 100**. Type numbers in this channel to guess it! You have **30 seconds**.`
        });

        await replyOrEdit(context, {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const filter = (m) => m.author.id === author.id;
        const collector = context.channel.createMessageCollector({ filter, time: 30000 });

        collector.on('collect', async (m) => {
            const guessVal = parseInt(m.content);
            if (isNaN(guessVal)) return;

            if (guessVal === secret) {
                collector.stop('won');
                await m.reply(`<a:pink8:1337678972108148757> Correct! The secret number was indeed **${secret}**!`);
            } else if (guessVal < secret) {
                await m.reply('Higher! 📈');
            } else {
                await m.reply('Lower! 📉');
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await context.channel.send(`⏳ Time's up! The secret number was **${secret}**.`);
            }
        });
    }
}

/**
 * Helper to reply cleanly whether message or interaction
 */
async function replyOrEdit(context, payload) {
    if (context.author) { // message
        return context.reply(payload).catch(() => { });
    } else { // interaction
        if (context.replied || context.deferred) {
            return context.followUp(payload).catch(() => { });
        }
        return context.reply(payload).catch(() => { });
    }
}

module.exports = {
    handleInteraction,
    handleRating,
    handleSocial,
    handleRandom,
    handleAnimal,
    handleGame
};
