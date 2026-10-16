export * from './lib/shared.module';
export * from './lib/proto.constants';

// Generated Protobuf Types (Source of truth: shared/proto/*.proto)
export * from './lib/generated/auth';
export * from './lib/generated/user';
export * from './lib/generated/order';

// Backward compatibility aliases
export type { AuthServiceClient as AuthGrpcService } from './lib/generated/auth';
export type { AuthUser as AuthUserModel } from './lib/generated/auth';
export type { UserServiceClient as UserGrpcService } from './lib/generated/user';
export type { User as UserGrpcModel } from './lib/generated/user';
export type { OrderServiceClient as OrderGrpcService } from './lib/generated/order';
