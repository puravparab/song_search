#!/bin/bash

cd client
npm ci

# Create .env.local file
echo "NEXT_PUBLIC_LAMBDA=" > .env.local

echo "Setup completed successfully!"
cd ..