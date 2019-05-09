echo ""
echo "********* Killing all running containers"
docker kill $(docker ps -a -q)
docker rm $(docker ps -a -q)

echo ""
echo "********* Copying sources"
cp src/auditor.js docker/image-auditor/src
cp src/orchestra-protocol.js docker/image-auditor/src
cp src/musician.js docker/image-musician/src
cp src/orchestra-protocol.js docker/image-musician/src

echo ""
echo "********* Removing and rebuilding images"
docker rmi res/musician
docker rmi res/auditor
docker build --tag res/auditor --file ./docker/image-auditor/Dockerfile ./docker/image-auditor/
docker build --tag res/musician --file ./docker/image-musician/Dockerfile ./docker/image-musician/

echo ""
echo "********* Removing sources from docker folders"
rm docker/image-musician/src/*.js
rm docker/image-auditor/src/*.js