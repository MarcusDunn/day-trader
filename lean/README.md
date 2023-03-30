## Setup

start postgres named daytrader on 5432

```bash
docker run -p 5432:5432 -e POSTGRES_PASSWORD=daytrader -e POSTGRES_USER=daytrader -e POSTGRES_DB=daytrader postgres
```

start jaeger

```bash
docker run -d --name jaeger \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.6
```