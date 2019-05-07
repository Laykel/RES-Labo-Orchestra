rm docker/image-auditor/src/*
cp src/auditor.js docker/image-auditor/src
cp src/orchestra-protocol.js docker/image-auditor/src
cp package.json docker/image-auditor/src

rm docker/image-musician/src/*
cp src/musician.js docker/image-musician/src
cp src/orchestra-protocol.js docker/image-musician/src
cp package.json docker/image-musician/src