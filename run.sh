cd frontend
echo "Build frontend..."
npm install
npm run build

cd ../relay-server
echo "Build relay server..."
npm install
npm run build

cd ../backend
echo "Build backend..."
npm install

cd ..
echo "Starting services..."

(sh run_backend.sh & sh run_relay.sh)
wait
