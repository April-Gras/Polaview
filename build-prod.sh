npm i
npx prisma generate
npm run client-build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build server scraper nginx