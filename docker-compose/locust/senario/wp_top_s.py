import time
from locust import HttpUser, task, between, constant_throughput, constant

class QuickstartUser(HttpUser):
    wait_time = constant_throughput(1)

    @task
    def hello_world(self):
        self.client.get("/index.php", verify=False)
