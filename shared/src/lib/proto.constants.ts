import * as path from 'path';
import * as fs from 'fs';

export const AUTH_PACKAGE = 'auth';
export const ORDER_PACKAGE = 'order';
export const USER_PACKAGE = 'user';


export const DEFAULT_AUTH_GRPC_PORT = 50051;
export const DEFAULT_ORDER_GRPC_PORT = 50052;

export const DEFAULT_AUTH_GRPC_URL = `0.0.0.0:${DEFAULT_AUTH_GRPC_PORT}`;
export const DEFAULT_ORDER_GRPC_URL = `0.0.0.0:${DEFAULT_ORDER_GRPC_PORT}`;

export function resolveProtoPath(protoFileName: string): string {
  const candidates = [
    path.join(__dirname, 'proto', protoFileName),
    path.join(__dirname, 'assets', 'proto', protoFileName),
    path.join(__dirname, '..', 'proto', protoFileName),
    path.join(__dirname, '..', '..', 'proto', protoFileName),
    path.join(__dirname, '..', '..', 'shared', 'proto', protoFileName),
    path.join(__dirname, '..', '..', '..', 'shared', 'proto', protoFileName),
    path.join(process.cwd(), 'shared', 'proto', protoFileName),
    path.join(process.cwd(), 'dist', 'shared', 'proto', protoFileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  return path.resolve(process.cwd(), 'shared', 'proto', protoFileName);
}

export function getAuthProtoPath(): string {
  return resolveProtoPath('auth.proto');
}

export function getUserProtoPath(): string {
  return resolveProtoPath('user.proto');
}

export function getOrderProtoPath(): string {
  return resolveProtoPath('order.proto');
}
