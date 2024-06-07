let currentDate = new Date(); // Начнем с текущей даты
let loading = false;
let lastLoadedDate = null;

document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    window.addEventListener('scroll', handleScroll);
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

            const currentFormattedDate = currentDate.toLocaleDateString();
            if (lastLoadedDate !== currentFormattedDate) {
                const dateLabel = document.createElement('div');
                dateLabel.className = 'date-label';
                dateLabel.textContent = currentFormattedDate;
                container.appendChild(dateLabel);
                lastLoadedDate = currentFormattedDate;
            }

            data.forEach(news => {
                const card = document.createElement('div');
                card.className = 'news-card';

                const title = `<h2>${news.country.flag} <a href="${news.url}">${news.title}</a></h2>`;
                const image = `<img src="${news.image}" alt="${news.title}">`;

                // Замена символов новой строки на <br>
                const summary = `<div class="summary">• ${news.summary.replace(/\n/g, '<br><br>• ')}</div>`;
                const created = `<div class="created">${new Date(news.created).toLocaleDateString()}</div>`;

                card.innerHTML = title + image + summary + created;
                container.appendChild(card);
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
        });
}