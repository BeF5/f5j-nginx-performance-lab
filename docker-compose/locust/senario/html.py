import time
from locust import HttpUser, task, between, constant_throughput, constant

class QuickstartUser(HttpUser):
    wait_time = constant_throughput(15)

    @task
    def hello_world(self):
        self.client.get("/html/index.html")

