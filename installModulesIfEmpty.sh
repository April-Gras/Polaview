if [ ! -d "node_modules" ]; then
  echo "node_modules folder doesn't exist"
  npm install
  exit 0
fi
