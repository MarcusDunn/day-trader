import * as grpc from '@grpc/grpc-js';

const server = new grpc.Server();
const port = process.env.PORT || 50051;
const credentials = grpc.ServerCredentials.createInsecure();

server.bindAsync(`0.0.0.0:${port}`, credentials, () => {
    server.start();
    console.log(`gRPC server started on port ${port}`);
});