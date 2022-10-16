npm i
npx prisma generate
npm run client-build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache auth-layer data-layer nginx