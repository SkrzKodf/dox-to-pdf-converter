## WordToPdfConverter

Сервис является прокси для пакета libreoffice-convert, использующий ядро LibreOffice для конвертации документов Doc в
Pdf

## Содержание:

- [Env](#env)

##  Env
Актуальный пример для .env файла по адресу `./config/.env`

```dotenv
NODE_ENV=development
SERVICE_NAME=WordToPdfConverter
PORT=3001
HOST=http://fedorichev.sknt.ru:3001
IS_STEND=false

SWAGGER_TITLE=WordToPdfConverter
SWAGGER_DESC='Сервис для конвертации doc в pdf.'
```