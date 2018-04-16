.. This work is licensed under a Creative Commons Attribution 4.0 International License.


Installation
------------

Install docker
^^^^^^^^^^^^^^^^^^^^^^^

sudo apt-add-repository 'deb https://apt.dockerproject.org/repo ubuntu-xenial main'

sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D

sudo apt-get update

apt-cache policy docker-engine

sudo apt-get install -y docker-engine

docker ps

Run esr-server docker
^^^^^^^^^^^^^^^^^^^^^^^

Login the ONAP docker registry first: sudo docker login -u docker -p docker nexus3.onap.org:10001

sudo docker pull nexus3.onap.org:10001/onap/aai/esr-server:latest

sudo docker run -i -t -d -p 9518:9518 -e MSB_ADDR=${MSB_SERVER_IP}:80 --name esr_server nexus3.onap.org:10001/onap/aai/esr-server:latest

Run esr-gui docker
^^^^^^^^^^^^^^^^^^^^^^^

sudo docker pull nexus3.onap.org:10001/onap/aai/esr-gui:latest

docker run -i -t -d -p 9519:8080 -e MSB_ADDR=${MSB_SERVER_IP}:80 --name esr_gui nexus3.onap.org:10001/onap/aai/esr-gui:latest

Check status of ESR
^^^^^^^^^^^^^^^^^^^^^^^

Test whether esr-server is running:

GET  https://ESR_SERVICE_IP:9518/api/aai-esr-server/v1/test 

The returned status should be 200.

Visit ESR portal:

http://ESR_SERVER_IP:9519/esr-gui/extsys/vnfm/vnfmView.html

http://ESR_SERVER_IP:9519/esr-gui/extsys/sdncontroller/sdncView.html

http://ESR_SERVER_IP:9519/esr-gui/extsys/vim/vimView.html

http://ESR_SERVER_IP:9519/esr-gui/extsys/ems/emsView.html

A&AI register to MSB
^^^^^^^^^^^^^^^^^^^^^^^

NOTE: The way bellow is register to MSB by hand, it is a temporary method. Later it will be registered automatic by MSB.

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "aai-cloudInfrastructure", "version": "v11", "url": "/aai/v11/cloud-infrastructure","protocol": "REST", "enable_ssl":"true", "visualRange":"1", "nodes": [ {"ip": "A&AI_SERVER_IP","port": "8443"}]}' "http://MSB_SERVER_IP:10081/api/microservices/v1/services"

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "aai-externalSystem", "version": "v11", "url": "/aai/v11/external-system","protocol": "REST", "enable_ssl":"true", "visualRange":"1", "nodes": [ {"ip": "A&AI_SERVER_IP","port": "8443"}]}' "http://MSB_SERVER_IP:10081/api/microservices/v1/services"

MultiCloud register to MSB
^^^^^^^^^^^^^^^^^^^^^^^

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "multicloud", "version": "v0", "url": "/api/multicloud/v0","protocol": "REST",  "nodes": [ {"ip": "'$MultiCloud_IP'","port": "9001"}]}' "http://$MSB_SERVER_IP:10081/api/microservices/v1/services"

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "multicloud-vio", "version": "v0", "url": "/api/multicloud-vio/v0","protocol": "REST",  "nodes": [ {"ip": "'$MultiCloud_IP'","port": "9004"}]}' "http://$MSB_SERVER_IP:10081/api/microservices/v1/services"

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "multicloud-ocata", "version": "v0", "url": "/api/multicloud-ocata/v0","protocol": "REST",  "nodes": [ {"ip": "'$MultiCloud_IP'","port": "9006"}]}' "http://$MSB_SERVER_IP:10081/api/microservices/v1/services"

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "multicloud-titanium_cloud", "version": "v0", "url": "/api/multicloud-titanium_cloud/v0","protocol": "REST",  "nodes": [ {"ip": "'$MultiCloud_IP'","port": "9005"}]}' "http://$MSB_SERVER_IP:10081/api/microservices/v1/services"

ESR register to MSB
^^^^^^^^^^^^^^^^^^^^^^^

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "aai-esr-server", "version": "v1", "url": "/api/aai-esr-server/v1","protocol": "REST", "enable_ssl":"true", "visualRange":"1", "nodes": [ {"ip": "ESR_SERVER_IP","port": "9518"}]}' "http://MSB_SERVER_IP:10081/api/microservices/v1/services"

curl -X POST -H "Content-Type: application/json" -d '{"serviceName": "aai-esr-gui", "version": "v1", "url": "/esr-gui","path": "/iui/aai-esr-gui","protocol": "UI",  "nodes": [ {"ip": "ESR_SERVER_IP","port": "9519"}]}' "http://MSB_SERVER_IP:10081/api/microservices/v1/services"

ESR usage
^^^^^^^^^^^^^^^^^^^^^^^

Visit ESR portal to manage the external systems.

http://MSB_SERVER_IP:80/iui/aai-esr-gui/extsys/vnfm/vnfmView.html

http://MSB_SERVER_IP:80/iui/aai-esr-gui/extsys/sdncontroller/sdncView.html

http://MSB_SERVER_IP:80/iui/aai-esr-gui/extsys/vim/vimView.html

http://MSB_SERVER_IP:80/iui/aai-esr-gui/extsys/ems/emsView.html