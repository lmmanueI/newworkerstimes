let currentDate = new Date(); // Начнем с текущей даты
let loading = false;
let lastLoadedDate = null;

const urlHash = window.location.hash;

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
    document.getElementById('loading').style.display = 'block';

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

            const currentFormattedDate = currentDate.toLocaleDateString();
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

            document.getElementById('loading').style.display = 'none';
            loading = false;

            // Переключение на предыдущий день
            currentDate.setDate(currentDate.getDate() - 1);
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            document.getElementById('loading').style.display = 'none';
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

function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';

    const cover = document.createElement('div');
    cover.className = 'news-cover';

    const title = `<span class="news-title" data-created="${news.created}">${news.title}</span>`;
    if (news.country) {
        cover.innerHTML = `<img src="${news.image}" alt="${news.title}">` + title + `<b>${news.country.flag}</b>`
    } else {
        cover.innerHTML = `<img src="${news.image}" alt="${news.title}">` + title
    }

    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.innerHTML = `•  ${news.summary.replace(/\n/g, '<br><br>•  ')}</div>`;

    const infoContainer = document.createElement('div');
    infoContainer.className = 'info-container';
    const created = `<div class="created">${new Date(news.created).toLocaleString()}</div>`;
    const sourceUrl = `<a class="source-url" href="${news.url}" target="_blank">${extractHostname(news.url)}</a>`;
    infoContainer.innerHTML = sourceUrl + created;

    card.appendChild(cover);
    card.appendChild(summary);
    card.appendChild(infoContainer);

    return card
}

function loadSingleNews(timestamp) {
    if (loading) return;
    loading = true;
    document.getElementById('loading').style.display = 'block';

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

            container.appendChild(createNewsCard(news));

            document.getElementById('loading').style.display = 'none';
            loading = false;
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            document.getElementById('loading').style.display = 'none';
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
