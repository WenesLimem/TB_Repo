<div id="top"></div>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/WenesLimem/TB_Repo">  </a>

<h3 align="center">Observer</h3>

  <p align="center">
    <br />
    <a href="https://github.com/WenesLimem/TB_Repo">View Demo</a>
    ·
    <a href="https://github.com/WenesLimem/TB_Repo/issues">Report Bug</a>
    ·
    <a href="https://github.com/WenesLimem/TB_Repo/issues">Request Feature</a>
  </p>
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
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project
This repo contains all files related to Bachelor's Degree Project. 
It contains two applications, deployment manfiests Kubernetes deplyoment, ready-to-use docker images. 

The first application is Sock-shop. It a demonstration application for micro-services by excellence. More info here : !()[https://github.com/microservices-demo]. 
To monitor the proper functioning of applications based on the microservices architecture and dedicated for cloud deployment, traditional tools  are insufficient to diagnose applications in case of failure.  
</br>
In the first part of this project, we analyzed the different types of architectures (monolithic and microservices), the Kubernetes container orchestrator, and different monitoring/logging tools. The majority of these tools are projects of the Cloud Native Computing Foundation. This part allowed the understanding and definition of a new concept called Observability. This new concept encompasses monitoring and logging, and adds to the latter two the collection of different metrics. </br>
In a second part, two observable systems were presented and deployed. The first system allowed us to test the observability tools in an environment that simulates a production application. On the other hand, the second system has been developed, presented and deployed in order to extend the observability layer from the infrastructure layer to the application layer using the same tools. These two systems allow us to conclude the effectiveness of the tools presented in the first part. 

### Built With
* NodeJS : https://nodejs.org/en/
* Express: https://expressjs.com/
* Prometheus : https://prometheus.io/
* Jaeger : https://jaegertracing.io/

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

### Installation 

The applications do not require any installation, we simply run the containers, apply K8s manfiests, or run the services using ```npm```.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

The repo contains two applications. 


