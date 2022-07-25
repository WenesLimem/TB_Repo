<div id="top">
</div>


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/WenesLimem/TB_Repo">  </a>

<h3 align="center">Observer</h3>

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project
This repo contains all files related to Bachelor's Degree Project. 
It contains two applications, deployment manfiests Kubernetes deplyoment, ready-to-use docker images. 

The first application is [sock-shop](https://github.com/microservices-demo). It a demonstration application for micro-services by excellence. 
</br> 
To monitor the proper functioning of applications based on the microservices architecture and dedicated for cloud deployment, traditional tools  are insufficient to diagnose applications in case of failure.  
</br>
In the first part of this project, we analyzed the different types of architectures (monolithic and microservices), the Kubernetes container orchestrator, and different monitoring/logging tools. The majority of these tools are projects of the Cloud Native Computing Foundation. This part allowed the understanding and definition of a new concept called Observability. This new concept encompasses monitoring and logging, and adds to the latter two the collection of different metrics. </br>
In a second part, two observable systems were presented and deployed. The first system allowed us to test the observability tools in an environment that simulates a production application. On the other hand, the second system has been developed, presented and deployed in order to extend the observability layer from the infrastructure layer to the application layer using the same tools. These two systems allow us to conclude the effectiveness of the tools presented in the first part. 

### Built With
* [NodeJS](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [Prometheus](https://prometheus.io/)
* [Jaeger](https://jaegertracing.io/)
* [Grafana](https://grafana.com/)

<!-- GETTING STARTED -->
## Getting Started

To get a local copy, clone the repo on your computer using the following command. 
```sh
git clone https://github.com/WenesLimem/TB_Repo
```
    

### Prerequisites

* npm
* Docker 
* Kubernetes cluster 
* Prometheus 
* Jaeger 
* Grafana

### Installation 

The applications do not require any installation, we simply run the containers, apply K8s manfiests, or run the services using ```npm```.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage
There is multiple methods to run|deploy E-shop-minimal application. For Sock-shop application, the only possibility is a deployment through Kubernetes manfiests. (Find more ways to run|deploy the application [here](https://github.com/microservices-demo)).  

### Sock-shop : 
* To deploy the application, make sure that Kubernetes is up & running 
```sh
kubetctl get pods 
```
* Apply  _full_weaveworks.yaml_ manifest found in sock-shop/ 
```sh
kubectl apply -f full_weavesocks.yaml
``` 
_Usually it takes around 2 minutes to start all the containers in a local Docker-Desktop's Kubernetes._

* Check the status of the pods. 
```sh
kubectl get pods -n sock-shop 
```

### E-shop-minimal : 
##### Running the application using _npm_:
_The example will just show how to run one service , the same steps will be repeated for each micro-service_
* To start the app , we need to move to the root folder of the micro-service and then start it. 
```sh
cd cart-service\
npm start 
```
You should be able to see the port the application is listening on the console output. 

##### Running the application using Docker 
Images corresponding the the application's micro-services can be found [here](https://hub.docker.com/w3n3s). 
* Pull and run containers from the images 

```sh
docker pull w3n3s\carts
docker pull w3n3s\products
docker pull w3n3s\users

docker run -d -t w3n3s\carts -p 4003:8081
docker run -d -t w3n3s\products -p 4002:8082
docker run -d -t w3n3s\users -p 4000:8083
```
* To make sure the containers are up and running
```sh
docker ps
```
A list of the running containers should be seen on the console output. 

##### Deploying the application to Kubernetes using the manfiests found in _K8s_Infra/_
