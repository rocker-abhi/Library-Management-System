import os
import sys
import grpc

# Add generated directory to path so it can import auth_grpc_pb2 relative to itself
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'generated'))

import auth_grpc_pb2
import auth_grpc_pb2_grpc

class AuthGrpcClient:
    def __init__(self, host=None, port=None):
        self.host = host or os.getenv("AUTH_GRPC_HOST", "localhost")
        self.port = port or os.getenv("AUTH_GRPC_PORT", "5100")
        self.channel = None
        self.stub = None

    def connect(self):
        address = f"{self.host}:{self.port}"
        self.channel = grpc.insecure_channel(address)
        self.stub = auth_grpc_pb2_grpc.AuthServiceStub(self.channel)

    def get_username_by_user_id(self, user_id: str) -> str:
        if not self.channel:
            self.connect()
        try:
            request = auth_grpc_pb2.GetUsernameRequest(user_id=user_id)
            response = self.stub.GetUsernameByUserId(request, timeout=5)
            return response.username
        except Exception as e:
            print(f"Error querying Auth gRPC: {e}")
            return ""

    def close(self):
        if self.channel:
            self.channel.close()
            self.channel = None
            self.stub = None
