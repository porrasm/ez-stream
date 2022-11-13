echo "Starting services..."
(sh run_backend.sh & sh run_relay.sh)
wait
