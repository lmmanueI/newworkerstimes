let currentDate = new Date(); // Начнем с текущей даты
let loading = false;
let lastLoadedDate = null;

const urlHash = window.location.hash;
const daysOfWeek = [
  'воскресенье', 'понедельник', 'вторник', 'среда',
  'четверг', 'пятница', 'суббота'
];
const months = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];
const googleTranslate = 'https://translate.google.com/translate?hl=en&sl=auto&tl=ru&u='
const timezoneOffset = currentDate.getTimezoneOffset() * 60 * 1000;
const moscowOffset = 180 * 60 * 1000;

window.addEventListener('popstate', function(event) {
    if (window.location.hash) {
        // open page
    } else {
        handleBackToList();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (urlHash) {
        loadSingleNews(urlHash.substring(1));
    } else {
        loadNews();
        window.addEventListener('scroll', handleScroll);
    }

    const backButton = document.getElementById('back-to-list');
    backButton.addEventListener('click', handleBackToList);
});

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
        loadNews();
    }
}

function loadNews() {
    if (loading) return;
    loading = true;

    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const url = `https://strikes.news/data/strikes_news/${year}/${month}/${day}.json`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('news-container');

            data.sort((a, b) => new Date(b.created) - new Date(a.created));

            const dayOfWeek = daysOfWeek[currentDate.getDay()];
            const month = months[currentDate.getMonth()];
            const currentFormattedDate = `${currentDate.getDate()} ${month}, ${dayOfWeek}`;
            if (lastLoadedDate !== currentFormattedDate) {
                const dateLabel = document.createElement('div');
                dateLabel.className = 'date-label';
                dateLabel.textContent = currentFormattedDate;
                container.appendChild(dateLabel);
                lastLoadedDate = currentFormattedDate;
            }

            data.forEach(news => {
                container.appendChild(createNewsCard(news));
            });

            document.querySelectorAll('.news-title').forEach(title => {
                title.addEventListener('click', function() {
                    const timestamp = new Date(this.dataset.created).getTime();
                    window.location.hash = `#${timestamp}`;
                    window.removeEventListener('scroll', handleScroll);
                    window.scrollTo(0, 0); // Scroll to the top
                    loadSingleNews(timestamp);
                });
            });

            loading = false;

            // Переключение на предыдущий день
            currentDate.setDate(currentDate.getDate() - 1);

            if (document.querySelectorAll('.news-card').length < 5) {
                loadNews();
            }
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            loading = false;

            // Попробуем загрузить новости за предыдущий день в случае ошибки
            currentDate.setDate(currentDate.getDate() - 1);
            loadNews();
        });
}

function extractHostname(url) {
    let hostname;
    // Find & remove protocol (http, https) and get hostname
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    // Find & remove port number
    hostname = hostname.split(':')[0];
    // Find & remove www
    hostname = hostname.replace(/^www\./, '');

    return hostname;
}

function createNewsCard(news, withSummary) {
    const card = document.createElement('div');
    card.className = 'news-card';

    const cover = document.createElement('div');

    const title = `<span class="news-title" data-created="${news.created}">${news.title}</span>`;
    if (news.image) {
        cover.className = 'news-cover with-image';
        if (news.country) {
            cover.innerHTML = `<img src="${news.image}" alt="${news.title}">` + title + `<b>${news.country.flag}</b>`
        } else {
            cover.innerHTML = `<img src="${news.image}" alt="${news.title}">` + title
        }
    } else {
        cover.className = 'news-cover';
        if (news.country) {
            cover.innerHTML = `<span class="news-title" data-created="${news.created}">${news.country.flag} ${news.title}</span>`;
        } else {
            cover.innerHTML = title
        }
    }
    card.appendChild(cover);

    if (withSummary) {
        const summary = document.createElement('div');
        summary.className = 'summary';
        summary.innerHTML = `•  ${news.summary.replace(/\n/g, '<br><br>•  ')}</div>`;
        card.appendChild(summary);
    }

    const infoContainer = document.createElement('div');
    infoContainer.className = 'info-container';
    const postTime = new Date(news.created).getTime() - moscowOffset - timezoneOffset;
    const date = new Date(postTime);
    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const created = `<div class="created">${date.getDate()} ${month}, ${dayOfWeek}, ${date.getHours()}:${date.getMinutes()}</div>`;
    const translationUrl = `<div><a class="translation-url" href="${googleTranslate}${encodeURI(news.url)}" target="_blank">🇷🇺</a>`;
    const sourceUrl = `&nbsp;&nbsp;<a class="source-url" href="${news.url}" target="_blank">${extractHostname(news.url)}</a></div>`;
    infoContainer.innerHTML = translationUrl + sourceUrl + created;
    card.appendChild(infoContainer);

    return card
}

function loadSingleNews(timestamp) {
    if (loading) return;
    loading = true;

    const date = new Date(parseInt(timestamp));
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const url = `https://strikes.news/data/strikes_news/${year}/${month}/${day}.json`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const news = data.find(news => new Date(news.created).getTime() === parseInt(timestamp));
            if (!news) {
                throw new Error('News with the given timestamp not found');
            }

            const container = document.getElementById('news-container');
            container.innerHTML = ''; // Clear previous content

            container.appendChild(createNewsCard(news, true));

            loading = false;
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            loading = false;
        });
}

function handleBackToList() {
    window.location.hash = ''; // Remove hash
    const container = document.getElementById('news-container');
    container.innerHTML = ''; // Clear current content
    currentDate = new Date(); // Reset current date to today
    lastLoadedDate = null;
    loadNews(); // Load the list of news
    window.scrollTo(0, 0); // Scroll to the top
    window.addEventListener('scroll', handleScroll); // Re-attach the scroll event listener
}
