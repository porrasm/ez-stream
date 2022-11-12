node -v

echo "Installing dependencies..."
cd frontend
npm install &

cd ../relay-server
npm install &

cd ../backend
npm install &

cd ..

# Wait
for job in `jobs -p`
do
    wait $job || let "FAIL+=1"
done

echo "Building..."


cd frontend
echo "Build frontend..."
npm run build &

cd ../relay-server
echo "Build relay server..."
npm run build &

cd ..

# Wait
for job in `jobs -p`
do
    wait $job || let "FAIL+=1"
done

echo "Starting services..."

sh run_backend.sh & 
sh run_relay.sh &

# Wait
for job in `jobs -p`
do
    wait $job || let "FAIL+=1"
done
