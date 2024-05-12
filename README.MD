## Это репозиторий телеграм-канала [@newworkerstimes](https://t.me/newworkerstimes)
Тут находятся файлы конфигурации инструмента [@sns_feed](https://t.me/sns_feed) ("*Strikes News Summary*"), который используется для сбора и разметки новостей о забастовках и профсоюзах со всего мира. 

Файлы из этого репозитория в режиме реального времени влияют на автоматическую публикацию новостей на телеграм-канале [@sns_feed](https://t.me/sns_feed).

**Алгоритм работы инструмента следующий:**

1. Из файла [sources.json](https://raw.githubusercontent.com/lmmanueI/newworkerstimes/master/sources.json) каждые 5 минут формируется список RSS источников новостей.
2. Все элементы RSS фильтруются проверкой **на наличие** слов из "белого списка" ([whitelist.json](https://raw.githubusercontent.com/lmmanueI/newworkerstimes/master/whitelist.json)). При фильтрации, для выбора слов для проверки, используется язык источника (поддерживаются языки из файла [countries.json](https://raw.githubusercontent.com/lmmanueI/newworkerstimes/master/countries.json)).
3. Все элементы RSS фильтруются проверкой **на отутствие** слов из "черного списка" ([blacklist.json](https://raw.githubusercontent.com/lmmanueI/newworkerstimes/master/blacklist.json)). Проверки на ключевые слова нужны для удешевления поддержки сервиса, чтобы уменьшить число переводов и запросов к ChatGPT.
4. Текст, прошедших предыдущие проверки элементов RSS, переводится на английский язык. ChatGPT лучше извлекает факты из текста на английском языке, чем YandexGPT из текста на русском.
5. Полученный перевод анализируется с помощью ChatGPT. Для извлечения фактов используется список вопросов из файла [questions.json](https://raw.githubusercontent.com/lmmanueI/newworkerstimes/master/questions.json). Поле `enabled` отвечает за отправку вопроса в ChatGPT, а поле `considered` - за учет результата при вынесении вердикта.
6. Если ChatGPT ответил положительно хотя бы на один из вопросов, то полный текст новости суммаризируется с помощью YandexGPT и публикуется на канале [@sns_feed](https://t.me/sns_feed). В планах использовать [jsonlogic](https://jsonlogic.com/) для описания сложной логики вопросов к ChatGPT.
7. В комментариях к каждой новости происходит ручная разметка страны новости, т.к. ChatGPT и YandexGPT плохо извлекают данный факт. Разметка происходит с помощью голосования читателей, поддерживаются страны из файла [countries.json](https://raw.githubusercontent.com/lmmanueI/newworkerstimes/master/countries.json).