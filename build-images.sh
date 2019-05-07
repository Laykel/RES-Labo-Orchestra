echo ""
echo "*** Killing all running containers"
echo ""
docker kill $(docker ps -a -q)
docker rm $(docker ps -a -q)

echo ""
echo "*** Removing and copying sources"
echo ""
rm docker/image-auditor/src/*.js
cp src/auditor.js docker/image-auditor/src
cp src/orchestra-protocol.js docker/image-auditor/src

echo ""
echo "*** Removing and rebuilding images"
echo ""
docker rmi res/auditor
docker build --tag res/auditor --file ./docker/image-auditor/Dockerfile ./docker/image-auditor/

echo ""
echo "*** Removing and copying sources"
echo ""
rm docker/image-musician/src/*.js
cp src/musician.js docker/image-musician/src
cp src/orchestra-protocol.js docker/image-musician/src

echo ""
echo "*** Removing and rebuilding images"
echo ""
docker rmi res/musician
docker build --tag res/musician --file ./docker/image-musician/Dockerfile ./docker/image-musician/