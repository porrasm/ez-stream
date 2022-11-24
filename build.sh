cd frontend
echo "Build frontend..."
npm install
npm run build

cd ../backend
echo "Build backend relay server..."
npm install
npm run build

cd ..
